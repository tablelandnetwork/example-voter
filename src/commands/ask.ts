import type yargs from "yargs"
import type { Arguments, CommandBuilder } from "yargs"
import { connect, ConnectOptions, ChainName } from "@tableland/sdk"
import { getWalletWithProvider, getLink } from "../utils"
import { TablelandVoter, TablelandVoter__factory } from "../../typechain-types"
import { deployments } from "../../deployments"

type Options = {
  // Local
  token: string
  question: string

  // Global
  privateKey: string
  chain: ChainName
  providerUrl: string
}

export const command = "ask <token> <question>"
export const desc = "Ask holders of an ERC721 collection a question."

export const builder: CommandBuilder<Options, Options> = (yargs) =>
  yargs
    .positional("token", {
      type: "string",
      description: "ERC721 token contract address to ask a question",
    })
    .positional("question", {
      type: "string",
      description: "Your question",
    }) as yargs.Argv<Options>

export const handler = async (argv: Arguments<Options>): Promise<void> => {
  const { token, question, privateKey, chain, providerUrl } = argv

  try {
    const out = await ask(token, question, privateKey, chain, providerUrl)
    console.log(out)
    process.exit(0)
  } catch (err: any) {
    console.error(err.message)
    process.exit(1)
  }
}

export const ask = async (
  token: string,
  question: string,
  privateKey: string,
  chain: ChainName,
  providerUrl: string
): Promise<string> => {
  const deployment = deployments[chain]
  if (!deployment) {
    throw new Error("unsupported chain (see `chains` command for details)")
  }

  const signer = getWalletWithProvider({
    privateKey,
    chain,
    providerUrl,
  })
  const options: ConnectOptions = {
    chain,
    rpcRelay: false,
    signer,
  }
  const voter = TablelandVoter__factory.connect(
    deployment.contractAddress,
    signer
  ) as TablelandVoter

  // Insert new question
  const questionsTable = await voter.getQuestionsTable()
  console.log(questionsTable)
  const insert = `insert into ${questionsTable}(token,body) values('${token}','${question}')`
  console.log(insert)
  const res = await connect(options).write(insert)

  // Show transaction info
  const link = getLink(chain, res.hash)
  return JSON.stringify({ ...res, link }, null, 2)
}
