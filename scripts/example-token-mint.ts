/*
 * Script to mint an example token
 */

import { ethers, network } from "hardhat"
import { exampleTokenAddress } from "../src/utils"

// You can update this to change the account you want to mint to.
// If the network is local-tableland the default hardhat accounts are used,
// otherwise the values set hardhat.config.ts are used.
const mintTo = 0

async function main() {
  console.log(`\nMinting on '${network.name}'...`)

  // Get owner account
  const accounts = await ethers.getSigners()
  const account = accounts[mintTo]
  if (account.provider === undefined) {
    throw Error("missing provider")
  }

  // Mint an ExampleToken
  const exampleToken = await ethers.getContractAt(
    "ExampleToken",
    exampleTokenAddress
  )

  const tx = await exampleToken.mint(account.address)
  await tx.wait()

  console.log("\nMinted an example token")
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
