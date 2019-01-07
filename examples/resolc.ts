//Example usage of ResoverEngine in solcjs-like wrapper for solc
//Prints only compiled contracts ABI

const solc = require("solc");
const chalk = require("chalk");
const yargs = require("yargs");

import { gatherSources } from "../src";

var argv = yargs.argv;
var files = argv._;

function missingImport(p: string) {
  console.log(chalk.magenta("File not supplied: ") + p);
  return { contents: "" };
}

gatherSources(files[0]).then(function(input) {
  let sources: { [s: string]: {} } = {};
  for (let file of input) {
    sources[file.path] = { content: file.source };
  }
  const inputJSON = {
    language: "Solidity",
    sources: sources,
    settings: {
      evmVersion: "byzantium",
      outputSelection: {
        "*": {
          "*": ["abi", "evm.bytecode"],
        },
      },
    },
  };

  const compiledContractsString = solc.compile(JSON.stringify(inputJSON), missingImport);
  const compiledContracts = JSON.parse(compiledContractsString);
  for (let e of compiledContracts.errors) {
    if (e.severity === "warning") {
      console.log(chalk.yellow(chalk.bold("warning:")));
    }
    if (e.severity === "error") {
      console.log(chalk.red(chalk.bold("error:")));
    }
    console.log(e.formattedMessage);
  }
  console.log(chalk.green(chalk.bold("COMPILED CONTRACTS:")));
  for (let key in compiledContracts.contracts) {
    console.log(chalk.blue("FILE: ") + chalk.bold(key));
    for (let contract in compiledContracts.contracts[key]) {
      console.log(chalk.cyan("Contract: ") + chalk.bold(contract));
      console.log(chalk.green("ABI: ") + chalk.bold(JSON.stringify(compiledContracts.contracts[key][contract].abi)));
      console.log();
    }
  }
});
