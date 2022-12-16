import { before, describe, test } from "mocha"
import mockStdin from "mock-stdin"
import { expect } from "chai"
// import { ethers } from "hardhat"
import { getAccounts } from "@tableland/local"
import { connect } from "@tableland/sdk"
import { deployments } from "../deployments"
import { TablelandVoter, TablelandVoter__factory } from "../typechain-types"
import { ask } from "../src/commands/ask"
import { answer } from "../src/commands/answer"
import { questions } from "../src/commands/questions"
import { answers } from "../src/commands/answers"
import { exampleTokenAddress } from "../src/utils"

// setup a mocked stdin that lets us interact with the cli
mockStdin.stdin()

const wait = function (time) {
  return new Promise((resolve) => setTimeout(() => resolve(), time))
}

describe("Ask command", function () {
  this.timeout(8000)

  const deployment = deployments["local-tableland"]
  const accounts = getAccounts()
  const tableland = connect({ chain: "local-tableland", signer: accounts[0] })

  let questionsTable, answersTable
  before(async function () {
    const signer = accounts[0]
    const voter = TablelandVoter__factory.connect(
      deployment.contractAddress,
      signer
    ) as TablelandVoter

    // Get signer answers
    questionsTable = await voter.getQuestionsTable()
    answersTable = await voter.getAnswersTable()
  })

  test("Should be able to ask a question", async function () {
    const questions0 = await tableland.read(`select * from ${questionsTable};`)
    expect(questions0.rows.length).to.equal(0)

    const resString = await ask(
      exampleTokenAddress,
      "what?",
      getAccounts()[1].privateKey,
      "local-tableland",
      "http://127.0.0.1:8545"
    )

    expect(typeof resString).to.equal("string")
    const res = JSON.parse(resString)

    expect(typeof res.hash).to.equal("string")
    expect(res.hash.length).to.equal(66)

    const questions1 = await tableland.read(`select * from ${questionsTable};`)
    expect(questions1.rows.length).to.equal(1)
  })

  test("Should be able to list questions I can answer", async function () {
    const resString = await questions(
      getAccounts()[1].privateKey,
      "local-tableland",
      "http://127.0.0.1:8545"
    )

    expect(typeof resString).to.equal("string")
    const res = JSON.parse(resString)

    expect(res.length).to.equal(1)
    expect(res[0].question).to.equal("what?")
    expect(res[0].votes).to.equal(0)
    expect(res[0].yes).to.equal(null)
  })

  test("Should be able to answer a question", async function () {
    const account = accounts[1]
    // answer command requires that we interact with a terminal prompt
    const answerPromise = answer(
      account.privateKey,
      "local-tableland",
      "http://127.0.0.1:8545"
    )
    await wait(100)
    // choose the first question
    process.stdin.send("\n")
    await wait(100)
    // choose yes
    process.stdin.send("y\n")
    const resString = await answerPromise

    expect(typeof resString).to.equal("string")
    const res = JSON.parse(resString)

    expect(typeof res.hash).to.equal("string")
    expect(res.hash.length).to.equal(66)
    expect(res.link).to.equal("")

    // Since the smart contract is sending the table write, we have
    // to wait until the transaction is materialized
    let answerReceipt
    let tries = 0
    while (!answerReceipt && tries < 7) {
      await wait(700)
      answerReceipt = await tableland.receipt(res.hash)
      tries += 1
    }

    const answers = await tableland.read(`select * from ${answersTable};`)

    expect(answers.rows.length).to.equal(1)
    // qid column, we answered the first question
    expect(answers.rows[0][0]).to.equal(1)
    // token column
    expect(answers.rows[0][1]).to.equal(exampleTokenAddress)
    // respondent column
    expect(answers.rows[0][2]).to.equal(account.address.toLowerCase())
    // vote column, 1 is yes
    expect(answers.rows[0][3]).to.equal(1)
  })

  test("Should be able to list answers I have given", async function () {
    const resString = await answers(
      getAccounts()[1].privateKey,
      "local-tableland",
      "http://127.0.0.1:8545"
    )

    expect(typeof resString).to.equal("string")
    const res = JSON.parse(resString)

    expect(res.length).to.equal(1)
    expect(res[0].question).to.equal("what?")
    expect(res[0].vote).to.equal(1)
  })
})
