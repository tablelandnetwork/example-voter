import type yargs from "yargs"
import type { Arguments, CommandBuilder } from "yargs"
import {
  connect,
  resultsToObjects,
  ConnectOptions,
  ChainName,
} from "@tableland/sdk"
import { getWalletWithProvider, getNftsForOwner } from "../utils.js"
import { TablelandVoter, TablelandVoter__factory } from "../../typechain-types"
import { deployments } from "../../deployments"

type Options = {
  // Local
  token: string

  // Global
  privateKey: string
  chain: ChainName
  providerUrl: string
}

export const command = "questions"
export const desc = "List questions you can answer based on NFT holdings."

export const builder: CommandBuilder<Options, Options> = (yargs) =>
  yargs as yargs.Argv<Options>

export const handler = async (argv: Arguments<Options>): Promise<void> => {
  const { privateKey, chain, providerUrl } = argv

  const deployment = deployments[chain]
  if (!deployment) {
    console.error(`chain ${chain} is not supported\n`)
    process.exit(1)
  }

  try {
    const signer = getWalletWithProvider({
      privateKey,
      chain,
      providerUrl,
    })
    const options: ConnectOptions = {
      chain,
    }
    const voter = TablelandVoter__factory.connect(
      deployment.contractAddress,
      signer
    ) as TablelandVoter

    // Look up signer's tokens
    const tokens = await getNftsForOwner(signer, chain, providerUrl)
    if (tokens.totalCount === 0) {
      console.error(`you don't have any questions to answer yet\n`)
      process.exit(1)
    }

    // Get questions for signer
    const questionsTable = await voter.getQuestionsTable()
    const answersTable = await voter.getAnswersTable()
    const conditions: string[] = []
    for (let i = 0; i < tokens.ownedNfts.length; i++) {
      conditions.push(`lower('${tokens.ownedNfts[i].contract.address}')`)
    }
    const query = `select ${questionsTable}.body as question, count(${answersTable}.respondent) as votes, sum(${answersTable}.vote) as yes 
      from ${questionsTable} 
      left join ${answersTable} 
      on ${questionsTable}.id = ${answersTable}.qid 
      and lower(${questionsTable}.token) = lower(${answersTable}.token) 
      and lower(${questionsTable}.token) in (${conditions.join(",")})
      group by id`
    const result = resultsToObjects(await connect(options).read(query))
    if (result.length === 0) {
      console.error(`no questions yet\n`)
      process.exit(1)
    }

    console.table(result)
    process.exit(0)
  } catch (err: any) {
    console.error(err.message)
    process.exit(1)
  }
}
