const test = require("tape");
// import { ethers } from "ethers"
// import { setup } from "./setupTest.js"
// import { getAccounts } from "@tableland/local/bin/cjs/main.js"
// import { ask } from "../../src/commands/ask.js"

const local = require("@tableland/local")
console.log(local)

// test("ask: setup", async function (t) {
//   await setup(t)
// })

test("Should be able to ask a question", async function () {
  // const provider = new ethers.providers.JsonRpcProvider()
  // const wallet = new ethers.Wallet(getAccounts()[1].privateKey, provider)
  // const res = await ask(
  //   "0x123",
  //   "what?",
  //   wallet.privateKey,
  //   "local-tableland",
  //   ""
  // )
  // console.log(res)
})
