import { ethers, network } from "hardhat"
import type { ExampleToken } from "../typechain-types"

async function main() {
  console.log(`\nDeploying to '${network.name}'...`)

  // Get owner account
  const [account] = await ethers.getSigners()
  if (account.provider === undefined) {
    throw Error("missing provider")
  }

  // Deploy a ExampleToken
  const ExampleTokenFactory = await ethers.getContractFactory("ExampleToken")
  const exampleToken = (await ExampleTokenFactory.deploy()) as ExampleToken
  await exampleToken.deployed()

  // Warn that addresses need to be saved in deployments file
  console.log(`\nExampleToken deployed to "${exampleToken.address}"`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
