import type yargs from "yargs"
import type { Arguments, CommandBuilder } from "yargs"
import {
  connect,
  resultsToObjects,
  ConnectOptions,
  ChainName,
} from "@tableland/sdk"
import { getWalletWithProvider, getNftsForOwner, getLink } from "../utils.js"
import { TablelandVoter, TablelandVoter__factory } from "../../typechain-types"
import { deployments } from "../../deployments"
import inquirer from "inquirer"

type Options = {
  // Local
  questionId: number

  // Global
  privateKey: string
  chain: ChainName
  providerUrl: string
}

export const command = "answer"
export const desc =
  "Answer a question. Only shows questions you can answer based on NFT holdings. You can only answer a question once."

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
    const conditions: string[] = []
    for (let i = 0; i < tokens.ownedNfts.length; i++) {
      conditions.push(`lower('${tokens.ownedNfts[i].contract.address}')`)
    }
    const query = `select * from ${questionsTable} where lower(token) in (${conditions.join(
      ","
    )})`
    const questions = resultsToObjects(await connect(options).read(query))
    if (questions.length === 0) {
      console.error(`you don't have any questions to answer yet\n`)
      process.exit(1)
    }

    // Prompt questions
    const choices: { name: string; value: number }[] = []
    for (const [k, v] of questions.entries()) {
      choices.push({ name: v.body, value: k })
    }
    const prompt = [
      {
        type: "list",
        name: "question",
        choices,
      },
      {
        type: "confirm",
        name: "answer",
        default: false,
      },
    ]
    const result = await inquirer.prompt(prompt)
    const question = questions[result.question]
    const answer = result.answer

    // Add answer
    const tx = await voter.answer(question.id, question.token, answer)
    await tx.wait()

    // Show transaction info
    const link = getLink(chain, tx.hash)
    const out = JSON.stringify({ hash: tx.hash, link }, null, 2)
    console.log(out)
    process.exit(0)
  } catch (err: any) {
    console.error(err.message)
    process.exit(1)
  }
}
