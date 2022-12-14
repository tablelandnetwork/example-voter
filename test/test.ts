import { describe, test } from "mocha"
import { expect } from "chai"
// import { ethers } from "hardhat"
import { getAccounts } from "@tableland/local"
import { ask, answer, questions, answers } from "../src/commands/ask"
import { exampleTokenAddress } from "../src/utils"

describe("Ask command", function () {
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

  test("Should be able to answer a question", async function () {
    const resString = await answer(
      exampleTokenAddress,
      "what?",
      getAccounts()[1].privateKey,
      "local-tableland",
      "http://127.0.0.1:8545"
    )

    expect(typeof resString).to.equal("string")
  })

  test("Should be able to list questions I can answer", async function () {
    const resString = await questions(
      exampleTokenAddress,
      "what?",
      getAccounts()[1].privateKey,
      "local-tableland",
      "http://127.0.0.1:8545"
    )

    expect(typeof resString).to.equal("string")
  })

  test("Should be able to list answers I have given", async function () {
    const resString = await answers(
      exampleTokenAddress,
      "what?",
      getAccounts()[1].privateKey,
      "local-tableland",
      "http://127.0.0.1:8545"
    )

    expect(typeof resString).to.equal("string")
  })
})
