import { Wallet, providers, getDefaultProvider } from "ethers"
import { ChainName } from "@tableland/sdk"
import getChains from "./chains"
import { Network, Alchemy, OwnedBaseNftsResponse } from "alchemy-sdk"

export interface Options {
  privateKey: string
  chain: ChainName
  providerUrl: string | undefined
}

// This is always the token address if deploying on a fresh local-tableland instance.
export const exampleTokenAddress = "0x5fc8d32690cc91d4c39d9d3abcbd16989f875707"

export function getLink(chain: ChainName, hash: string): string {
  if (!hash) {
    return ""
  }
  if (chain.includes("ethereum")) {
    if (chain.includes("goerli")) {
      return `https://goerli.etherscan.io/tx/${hash}`
    }
    return `https://etherscan.io/tx/${hash}`
  } else if (chain.includes("polygon")) {
    if (chain.includes("mumbai")) {
      return `https://mumbai.polygonscan.com/tx/${hash}`
    }
    return `https://polygonscan.com/tx/${hash}`
  } else if (chain.includes("optimism")) {
    if (chain.includes("goerli")) {
      return `https://goerli-optimism.etherscan.io/tx/${hash}`
    }
    return `https://optimistic.etherscan.io/tx/${hash}`
  } else if (chain.includes("arbitrum")) {
    if (chain.includes("goerli")) {
      return `https://goerli-rollup-explorer.arbitrum.io/tx/${hash}`
    }
    return `https://arbiscan.io/tx/${hash}`
  }
  return ""
}

export async function getNftsForOwner(
  wallet: Wallet,
  chain: ChainName,
  providerUrl: string
): Promise<OwnedBaseNftsResponse> {
  const parts = providerUrl.split("/")
  const key = parts[parts.length - 1]

  let net: Network
  switch (chain) {
    case "optimism-goerli":
      net = Network.OPT_GOERLI
      break
    case "polygon-mumbai":
      net = Network.MATIC_MUMBAI
      break
    default:
      throw new Error("unsupported chain (see `chains` command for details)")
  }

  const settings = {
    apiKey: key,
    network: net,
  }
  const alchemy = new Alchemy(settings)
  return await alchemy.nft.getNftsForOwner(wallet.address, {
    omitMetadata: true,
  })
}

export function getSignerOnly({
  privateKey,
  chain,
}: {
  privateKey: string
  chain: ChainName
}): Wallet {
  if (!privateKey) {
    throw new Error("missing required flag (`-k` or `--privateKey`)")
  }
  const network = getChains()[chain]
  if (!network) {
    throw new Error("unsupported chain (see `chains` command for details)")
  }

  const signer = new Wallet(privateKey)
  return signer
}

export function getWalletWithProvider({
  privateKey,
  chain,
  providerUrl,
}: Options): Wallet {
  if (!privateKey) {
    throw new Error("missing required flag (`-k` or `--privateKey`)")
  }
  const network = getChains()[chain]
  if (!network) {
    throw new Error("unsupported chain (see `chains` command for details)")
  }

  const wallet = new Wallet(privateKey)
  let provider: providers.BaseProvider =
    chain === "local-tableland"
      ? getDefaultProvider("http://127.0.0.1:8545")
      : new providers.JsonRpcProvider(providerUrl, network.name)
  if (!provider) {
    // This will be significantly rate limited, but we only need to run it once
    provider = getDefaultProvider(network)
  }
  if (!provider) {
    throw new Error("unable to create ETH API provider")
  }
  return wallet.connect(provider)
}
