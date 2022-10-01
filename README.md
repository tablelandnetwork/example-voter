# example-voter

[![Review](https://github.com/tablelandnetwork/example-voter/actions/workflows/review.yml/badge.svg)](https://github.com/tablelandnetwork/example-voter/actions/workflows/review.yml)
[![License](https://img.shields.io/github/license/tablelandnetwork/example-voter.svg)](./LICENSE)
[![Version](https://img.shields.io/github/package-json/v/tablelandnetwork/example-voter.svg)](./package.json)
[![standard-readme compliant](https://img.shields.io/badge/standard--readme-OK-green.svg)](https://github.com/RichardLitt/standard-readme)

> A simple voting mechanism built with Tableland

# Table of Contents

- [example-voter](#example-voter)
- [Table of Contents](#table-of-contents)
- [Background](#background)
- [Usage](#usage)
- [Install](#install)
- [Config](#config)
- [Development](#development)
- [Contributing](#contributing)
- [License](#license)

# Background

`example-voter` is an experimental voting system built on Tableland. You can use this tool to ask y/n questions of an entire ERC721 collection. Only holders of the token will be able to answer your questions. Use this as an example of how you might build an all-in-one [Snapshot](https://snapshot.org/) like system with Tableland. Anyone can create questions and query results from the Tableland network.

# Usage

```bash
> voter --help

voter <command>

Commands:
  voter init [format, path, yes]  Create config file
  voter ask <token> <question>    Ask holders of an ERC721 collection a
                                  question.
  voter answer                    Answer a question. Only shows questions you
                                  can answer based on NFT holdings. You can only
                                  answer a question once.
  voter questions                 List questions you can answer based on NFT
                                  holdings.
  voter answers                   List answers you have given.

Options:
      --help         Show help                                         [boolean]
      --version      Show version number                               [boolean]
  -k, --privateKey   Private key string                                 [string]
  -c, --chain        The EVM chain to target[string] [default: "polygon-mumbai"]
  -p, --providerUrl  JSON RPC API provider URL. (e.g.,
                     https://eth-rinkeby.alchemyapi.io/v2/123abc123a...)[string]
```

# Install

The `example-voter` package isn't published to NPM, but you can build the CLI locally:

```
git clone https://github.com/tablelandnetwork/example-voter.git
cd example-voter
npm install
npm run build
npm install -g .
voter --help
```

# Config

`voter` uses [cosmiconfig](https://github.com/davidtheclark/cosmiconfig) for configuration file support. This means you can configure `voter` via (in order of precedence):

- A `.voterrc.json`, `.voterrc.yml`, or `.voterrc.yaml` file.
- A `.voterrc` file written in JSON or YAML.
- A `"voter"` key in a local `package.json` file.

The configuration file will be resolved starting from the current working directory, and searching up the file tree until a config file is (or isn’t) found.

`voter` intentionally doesn’t support any kind of global configuration. This is to make sure that when a project is copied to another computer, `voter`'s behavior stays the same. Otherwise, `voter` wouldn’t be able to guarantee that everybody in a team uses the same consistent settings.

The options you can use in the configuration file are the same as the global cli flag options. Additionally, all of these configuration values can be overriden via environement variables (prefixed with `VOTER_`), or via a local `.env` file. See `.env.example` for an example.

A configuration file can also be bootstrapped using the `voter init` command. This will provide an interactive prompt to setup a config file (you can skip the interactive prompts by using the `--yes` flag). Global cli flags can be used in combination with the `init` command to skip specific questions. For example `voter init --chain "optimism-goerli"` will skip the question about default chain, and use `optimism-goerli` in the output config file.

# Development

Get started with installing and building the project:

```shell
npm install
npm run build
```

# Contributing

PRs accepted.

Small note: If editing the README, please conform to the
[standard-readme](https://github.com/RichardLitt/standard-readme) specification.

# License

[The Unlicense](LICENSE)
