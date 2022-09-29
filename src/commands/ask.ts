import type yargs from "yargs"
import type { Arguments, CommandBuilder } from "yargs"
import { connect, ConnectOptions, ChainName } from "@tableland/sdk"
import { getWalletWithProvider, getLink } from "../utils.js"
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
export const desc = "Author a new question"

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
      rpcRelay: false,
      signer,
    }
    const voter = TablelandVoter__factory.connect(
      deployment.contractAddress,
      signer
    ) as TablelandVoter

    // Insert new question
    const questionsTable = await voter.getQuestionsTable()
    const insert = `insert into ${questionsTable}(token,body) values('${token}','${question}')`
    const res = await connect(options).write(insert)

    // Show transaction info
    const link = getLink(chain, res.hash)
    const out = JSON.stringify({ ...res, link }, null, 2)
    console.log(out)
    process.exit(0)
  } catch (err: any) {
    console.error(err.message)
    process.exit(1)
  }
}
