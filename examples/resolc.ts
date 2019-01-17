//Example usage of ResoverEngine in solcjs-like wrapper for solc
//Prints only compiled contracts ABI

const solc = require("solc");
const chalk = require("chalk");
const yargs = require("yargs");

import glob = require("glob");
import { gatherSources } from "../src/solidity";

var argv = yargs.argv;
var filesGlob: string = "{" + argv._.join() + ",}";

function missingImport(p: string) {
  console.log(chalk.magenta("File not supplied: ") + p);
  return { contents: "" };
}

glob(filesGlob, function(er: Error | null, fileList: Array<string>) {
  gatherSources(fileList, process.cwd()).then(function(input) {
    let sources: { [s: string]: {} } = {};
    for (let file of input) {
      sources[file.url] = { content: file.source };
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
});
