import { after, before } from "mocha"
import chai from "chai"
import chaiAsPromised from "chai-as-promised"
import { ethers } from "hardhat"
import { LocalTableland, getAccounts } from "@tableland/local"
import type { ExampleToken, TablelandVoter } from "../typechain-types"

chai.use(chaiAsPromised)

const lt = new LocalTableland({ silent: true })
const accounts = getAccounts()

before(async function () {
  console.log("setup before")
  this.timeout(25000)
  lt.start()
  await lt.isReady()

  // Deploy a TablelandVoter
  const TablelandVoterFactory = await ethers.getContractFactory(
    "TablelandVoter"
  )
  const voter = (await TablelandVoterFactory.deploy()) as TablelandVoter
  await voter.deployed()

  // optimistically wait 5 seconds to allow the Validator
  // to materialize the Smart Contract's tables.
  // NOTE: to determine if a table has been materialized using the transaction hash
  //       you can use the REST API endpoint /receipt/{chainId}/{transactionHash}
  await new Promise((resolve) => setTimeout(() => resolve(), 5000))

  // Deploy an ExampleToken contract.
  const ExampleTokenFactory = await ethers.getContractFactory("ExampleToken")

  const exampleToken = (await ExampleTokenFactory.deploy()) as ExampleToken
  const tokenContract = await exampleToken.deployed()

  // Mint a token for the first 5 accounts.
  for (let i = 0; i < 5; i++) {
    const tx = await tokenContract.mint(accounts[i].address)
    await tx.wait()
  }
})

after(async function () {
  await lt.shutdown()
})
