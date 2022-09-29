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
    contractAddress: "0x904BE1260c9f25c6903ACC5b817BD392FD81c697",
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
