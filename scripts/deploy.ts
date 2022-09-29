import { ethers, network, voterDeployment } from "hardhat";
import type { TablelandVoter } from "../typechain-types";
import { connect, ConnectOptions } from "@tableland/sdk";
import fetch from "node-fetch";

// @ts-ignore
globalThis.fetch = fetch;

async function main() {
  console.log(`\nDeploying to '${network.name}'...`);

  // Get owner account
  const [account] = await ethers.getSigners();
  if (account.provider === undefined) {
    throw Error("missing provider");
  }

  // Don't allow multiple deployments per network
  if (voterDeployment.contractAddress !== "") {
    throw Error(`already deployed to '${network.name}'`);
  }

  // Connect to tableland
  const options: ConnectOptions = {
    // chain: SUPPORTED_CHAINS[network as ChainName],
    signer: account,
  };
  connect(options);

  // Create questions table
  // const createRes = await tbl!.create(
  //   "id integer primary key, contract text, body text",
  //   { prefix: "voter_questions" }
  // );
  // const questionsTable = createRes.name!;
  // console.log("Questions table created as:", questionsTable);

  // Deploy a TablelandVoter
  const TablelandVoterFactory = await ethers.getContractFactory(
    "TablelandVoter"
  );
  const voter = (await TablelandVoterFactory.deploy()) as TablelandVoter;
  await voter.deployed();
  console.log("Deployed TablelandVoter:", voter.address);

  // Warn that addresses need to be saved in deployments file
  console.warn(
    `\nSave 'deployments.${network.name}.contractAddress: "${voter.address}"' in deployments.ts!`
  );
  // console.warn(
  //   `Save 'deployments.${network.name}.questionsTable: "${questionsTable}"' in deployments.ts!`
  // );
  // console.warn(
  //   `Save 'deployments.${network.name}.allowlistTable: "${allowlistTable}"' in deployments.ts!`
  // );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
