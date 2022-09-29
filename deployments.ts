export interface VoterDeployment {
  // Contracts
  contractAddress: string

  // Tables network
  tablelandHost:
    | "https://testnet.tableland.network"
    | "https://staging.tableland.network"
    | "http://localhost:8080"
}

export interface VoterDeployments {
  [key: string]: VoterDeployment
}

export const deployments: VoterDeployments = {
  "optimism-goerli": {
    contractAddress: "0x8fBBd47Dd357d687750Cf7E5754cA9842f2C51CD",
    tablelandHost: "https://testnet.tableland.network",
  },
  "polygon-mumbai": {
    contractAddress: "",
    tablelandHost: "https://testnet.tableland.network",
  },
  localhost: {
    contractAddress: "",
    tablelandHost: "http://localhost:8080",
  },
}
