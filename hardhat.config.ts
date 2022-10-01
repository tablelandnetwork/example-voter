import * as dotenv from "dotenv"

import { HardhatUserConfig, extendEnvironment } from "hardhat/config"
import { HardhatRuntimeEnvironment } from "hardhat/types"
import "@nomiclabs/hardhat-ethers"
import "@nomiclabs/hardhat-etherscan"
import "@nomiclabs/hardhat-waffle"
import "@typechain/hardhat"
import "hardhat-dependency-compiler"
import "hardhat-gas-reporter"
import "hardhat-contract-sizer"
import "solidity-coverage"
import { deployments, VoterDeployment, VoterDeployments } from "./deployments"

dotenv.config()

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.15",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  dependencyCompiler: {
    paths: ["@tableland/evm/contracts/TablelandTables.sol"],
  },
  contractSizer: {
    alphaSort: true,
    disambiguatePaths: false,
    runOnCompile: false,
    strict: true,
    only: [],
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
  etherscan: {
    apiKey: {
      optimisticGoerli: process.env.OPTIMISM_ETHERSCAN_API_KEY || "",
      polygonMumbai: process.env.POLYSCAN_API_KEY || "",
    },
  },
  networks: {
    "optimism-goerli": {
      url: process.env.PROVIDER_URL ?? "",
      accounts:
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
    "polygon-mumbai": {
      url: process.env.PROVIDER_URL ?? "",
      accounts:
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
    // devnets
    hardhat: {
      mining: {
        auto: !(process.env.HARDHAT_DISABLE_AUTO_MINING === "true"),
        interval: [100, 3000],
      },
    },
  },
  config: {
    deployments,
  },
}

interface VoterNetworkConfig {
  deployments: VoterDeployments
}

declare module "hardhat/types/config" {
  // eslint-disable-next-line no-unused-vars
  interface HardhatUserConfig {
    config: VoterNetworkConfig
  }
}

declare module "hardhat/types/runtime" {
  // eslint-disable-next-line no-unused-vars
  interface HardhatRuntimeEnvironment {
    voterDeployment: VoterDeployment
  }
}

extendEnvironment((hre: HardhatRuntimeEnvironment) => {
  // Get configs for user-selected network
  const config = hre.userConfig.config
  hre.voterDeployment = (config.deployments as any)[hre.network.name]
})

export default config
