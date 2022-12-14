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
    contractAddress: "0x0665B0Ee94880d5E2b2368912311E48517D5Bdd8",
    tablelandHost: "https://testnet.tableland.network",
  },
  "polygon-mumbai": {
    contractAddress: "",
    tablelandHost: "https://testnet.tableland.network",
  },
  "local-tableland": {
    // this is the address assuming you deploy on a fresh local-tableland instance
    contractAddress: "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9",
    tablelandHost: "http://localhost:8080",
  },
}
