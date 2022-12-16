import { describe, test } from "mocha"
import mockStdin from "mock-stdin"
import { expect } from "chai"
// import { ethers } from "hardhat"
import { getAccounts } from "@tableland/local"
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
  this.timeout(10000)
  test("Should be able to ask a question", async function () {
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
    // answer command requires that we interact with a terminal prompt
    const answerPromise = answer(
      getAccounts()[1].privateKey,
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
  })

  test("Should be able to list answers I have given", async function () {
    const resString = await answers(
      getAccounts()[1].privateKey,
      "local-tableland",
      "http://127.0.0.1:8545"
    )

    expect(typeof resString).to.equal("string")
  })
})
