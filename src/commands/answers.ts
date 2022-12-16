import type yargs from "yargs"
import type { Arguments, CommandBuilder } from "yargs"
import {
  connect,
  resultsToObjects,
  ConnectOptions,
  ChainName,
} from "@tableland/sdk"
import { getWalletWithProvider } from "../utils"
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

export const command = "answers"
export const desc = "List answers you have given."

export const builder: CommandBuilder<Options, Options> = (yargs) =>
  yargs as yargs.Argv<Options>

export const handler = async (argv: Arguments<Options>): Promise<void> => {
  const { privateKey, chain, providerUrl } = argv

  try {
    const out = await answers(privateKey, chain, providerUrl)
    console.table(out)
    process.exit(0)
  } catch (err: any) {
    console.error(err.message)
    process.exit(1)
  }
}

export const answers = async (
  privateKey: string,
  chain: ChainName,
  providerUrl: string
): Promise<string> => {
  const deployment = deployments[chain]
  if (!deployment) {
    throw new Error(`chain ${chain} is not supported\n`)
  }

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

  // Get signer answers
  const questionsTable = await voter.getQuestionsTable()
  const answersTable = await voter.getAnswersTable()
  const query = `select ${questionsTable}.body as question, ${answersTable}.vote 
    from ${answersTable} 
    join ${questionsTable} 
    on ${questionsTable}.id = ${answersTable}.qid 
    and lower(${questionsTable}.token) = lower(${answersTable}.token) 
    and lower(${answersTable}.respondent)=lower('${signer.address}')
    group by qid`
  const result = resultsToObjects(await connect(options).read(query))
  if (result.length === 0) {
    return "no answers yet\n"
  }

  return JSON.stringify(result, null, 2)
}
