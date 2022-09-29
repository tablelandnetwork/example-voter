import { run, network, voterDeployment } from "hardhat"

async function main() {
  console.log(`\nVerifying on '${network.name}'...`)

  // Ensure deployments
  if (voterDeployment.contractAddress === "") {
    throw Error(`no contractAddress entry for '${network.name}'`)
  }

  // Verify voter
  await run("verify:verify", {
    address: voterDeployment.contractAddress,
  })
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
