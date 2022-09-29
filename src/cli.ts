#!/usr/bin/env node

import * as dotenv from "dotenv";
import fetch from "node-fetch";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { commands } from "./commands/index.js";
import { cosmiconfigSync } from "cosmiconfig";

// @ts-ignore
globalThis.fetch = fetch;

// By default, check these places for an rc config
const moduleName = "voter";
const explorer = cosmiconfigSync(moduleName, {
  searchPlaces: [
    `.${moduleName}rc.yaml`,
    `.${moduleName}rc.yml`,
    `.${moduleName}rc.json`,
    `.${moduleName}rc`, // Can be yaml or json
    "package.json", // For the ts/js devs in the house
  ],
});
const config = explorer.search();

// If a dotenv file (or exported env vars) are provided, these override any config values
dotenv.config();

// eslint-disable-next-line no-unused-vars
const _argv = yargs(hideBin(process.argv))
  .parserConfiguration({
    "strip-aliased": true,
    "strip-dashed": true,
    "camel-case-expansion": true,
  })
  .command(commands as any)
  .env("VOTER")
  .config(config?.config)
  .option("privateKey", {
    alias: "k",
    type: "string",
    description: "Private key string",
  })
  .option("chain", {
    alias: "c",
    type: "string",
    description: "The EVM chain to target",
    default: "polygon-mumbai",
  })
  .options("providerUrl", {
    alias: "p",
    type: "string",
    description:
      "JSON RPC API provider URL. (e.g., https://eth-rinkeby.alchemyapi.io/v2/123abc123a...)",
  })
  .demandCommand(1, "")
  .strict().argv;
