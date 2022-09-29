import { ethers, network, voterDeployment } from "hardhat"
import type { TablelandVoter } from "../typechain-types"

async function main() {
  console.log(`\nDeploying to '${network.name}'...`)

  // Get owner account
  const [account] = await ethers.getSigners()
  if (account.provider === undefined) {
    throw Error("missing provider")
  }

  // Don't allow multiple deployments per network
  if (voterDeployment.contractAddress !== "") {
    throw Error(`already deployed to '${network.name}'`)
  }

  // Deploy a TablelandVoter
  const TablelandVoterFactory = await ethers.getContractFactory(
    "TablelandVoter"
  )
  const voter = (await TablelandVoterFactory.deploy()) as TablelandVoter
  await voter.deployed()
  console.log("Deployed TablelandVoter:", voter.address)

  // Warn that addresses need to be saved in deployments file
  console.warn(
    `\nSave 'deployments.${network.name}.contractAddress: "${voter.address}"' in deployments.ts!`
  )
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
