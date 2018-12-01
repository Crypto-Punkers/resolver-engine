//Example usage of ResoverEngine in solcjs-like wrapper for solc
//Prints only compiled contracts ABI

const solc = require("solc");
const chalk = require("chalk");
const yargs = require("yargs");
const path = require("path");

import {SolidityImportResolver} from "../src";
const resolver = SolidityImportResolver();

var argv = yargs.argv;
var files = argv._;

console.log(chalk.cyan("Supplied files: ") + files);

//based on https://stackoverflow.com/a/14210948/8482839
function getAllGroupMatches(text : string, regex : RegExp, index? : number) : string[] {
	index || (index = 1);
	let matches : string[] = [];
	let match : RegExpExecArray | null;
	while (match = regex.exec(text)) {
		matches.push(match[index]);
	}
	return matches;
}

function solidifyImportName(origName : string) : string {
	return origName.split("./").pop()!;
}

interface ImportQueueItem {
	cwd: string;
	importName: string;
}

async function resolveInputFiles(fileList : string[]) {
	let input : {[index: string] : {[index: string] : string}} = {};
	let queue : ImportQueueItem[] = [];

	for (let i in fileList) {
		queue.push({cwd: process.cwd(), importName: fileList[i]});
	}

	while (queue.length > 0) {
		let fileData : ImportQueueItem = queue.shift()!;
		let file : string = fileData.importName;
		console.log(chalk.green("Processing file: ") + file);

		let fileSolc = solidifyImportName(file);

		let tmp = await resolver.require(file, fileData.cwd);

		if (!(file in input)) {
			input[fileSolc] = {"content": tmp.source};

			//TODO make better regex
			//this one finds only lines like:
			//	import "path";
			let regex = /import \"([^\"]+)\";/g;
			let imported = getAllGroupMatches(tmp.source, regex)
			if (imported.length === 0) {
				continue;
			}
			console.log("This file imports: " + chalk.cyan(imported));
			for (let i in imported) {
				queue.push({cwd: path.dirname(tmp.path), importName : imported[i]});
			}
		}
		else {
// 			console.log(chalk.red(tmp.path + " is already in 'input'"));
		}
	}

	return input;
}

function missingImport(p : string) {
	console.log(chalk.magenta("File not supplied: ") + p);
	return {'contents': ""};
}

resolveInputFiles(files).then(function(input) {
	let inputJSON = {
		language: "Solidity",
		sources: input,
		settings: {
			evmVersion: "byzantium",
			outputSelection: {
				"*": {
					"*": [ "abi", "evm.bytecode" ]
				}
			}
		}
	};

	let compiledContractsString = solc.compile(JSON.stringify(inputJSON), missingImport);
	let compiledContracts = JSON.parse(compiledContractsString);
	console.log(chalk.green(chalk.bold("COMPILED CONTRACTS:")));
	for (let key in compiledContracts.contracts) {
		console.log(chalk.blue("FILE: ") + chalk.bold(key));
		for (let contract in compiledContracts.contracts[key]) {
			console.log(chalk.cyan("Contract: ") + chalk.bold(contract));
			console.log(chalk.green("ABI: ") + chalk.bold(JSON.stringify(compiledContracts.contracts[key][contract].abi)));
		}
	}
});
