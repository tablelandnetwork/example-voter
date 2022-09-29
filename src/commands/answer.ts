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
export const desc = "Answer a question"

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
      conditions.push(`lower(token)='${tokens.ownedNfts[i].contract.address}'`)
    }
    const query = `select * from ${questionsTable} where ${conditions.join(
      " or "
    )}`
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
    let prompt = [
      {
        type: "list",
        name: "question",
        message: "Select a question to answer",
        choices,
      },
    ]
    const selection = questions[(await inquirer.prompt(prompt)).question]
    prompt = [
      {
        type: "input",
        name: "answer",
        message: "",
        choices: [selection.body],
      },
    ]
    const answer = (await inquirer.prompt(prompt)).answer

    // Add answer
    const tx = await voter.answer(selection.id, selection.token, answer)
    await tx.wait()

    const answersTable = await voter.getAnswersTable()
    console.log(answersTable)

    // Show transaction info
    const link = getLink(chain, tx.hash)
    const out = JSON.stringify({ link }, null, 2)
    console.log(out)
    process.exit(0)
  } catch (err: any) {
    console.error(err.message)
    process.exit(1)
  }
}
