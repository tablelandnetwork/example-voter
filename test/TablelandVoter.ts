// import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
// import chai from "chai"
// import chaiAsPromised from "chai-as-promised"
// import { ethers } from "hardhat"
// import { TablelandVoter, TablelandTables } from "../typechain-types"

// chai.use(chaiAsPromised)
// // const expect = chai.expect

// describe("Rigs", function () {
//   let tables: TablelandTables
//   let voter: TablelandVoter
//   let accounts: SignerWithAddress[]

//   beforeEach(async function () {
//     accounts = await ethers.getSigners()

//     const TablesFactory = await ethers.getContractFactory("TablelandTables")
//     tables = await (
//       (await TablesFactory.deploy()) as TablelandTables
//     ).deployed()

//     const VoterFactory = await ethers.getContractFactory("TablelandVoter")
//     voter = await (
//       (await VoterFactory.deploy(tables.address)) as TablelandVoter
//     ).deployed()
//   })

//   it("Should be able to answer", async function () {
//     const respondent = accounts[1]
//     await voter.connect(respondent).answer(1, accounts[2].address, "foo")
//   })
// })
