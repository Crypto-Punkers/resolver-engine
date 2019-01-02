import { FsParser, SubParser } from "../parsers";
import { ResolverEngine } from "../resolverengine";
import { FsResolver, GithubResolver, NodeResolver, UrlResolver } from "../resolvers";
import { EthPmResolver } from "./ethpmresolver";

export interface ImportFile {
  path: string;
  source: string;
}

export function ImportParser(): SubParser<ImportFile> {
  const fsParser = FsParser();

  return async path => {
    const source = await fsParser(path);
    if (!source) {
      return null;
    }
    return {
      path,
      source,
    };
  };
}

export function SolidityImportResolver() {
  return new ResolverEngine<ImportFile>()
    .addResolver(FsResolver())
    .addResolver(EthPmResolver())
    .addResolver(NodeResolver())
    .addResolver(GithubResolver())
    .addResolver(UrlResolver())
    .addParser(ImportParser());
}

export function findImports(data: ImportFile) : string[] {
  let result: string[] = [];
  const regex: RegExp = /import \"([^\"]+)\";/g;
  let match: RegExpExecArray | null;
  while (match = regex.exec(data.source)) {
    result.push(match[1]);
  }
  return result;
}

// when importing files from parent directory solc requests sifferent file name
// e.g. for "../dir/file" solc requests fine named "dir/file"
// solidifyName returns file name that will  be requested by solc
export function solidifyName(fileName: string) : string {
  return fileName.split("./").pop()!;
}

export async function gatherSources(what: string, workingDir?: string, resolver: ResolverEngine<ImportFile> = SolidityImportResolver()): Promise<ImportFile[]> {
  let result: ImportFile[] = [];
  const path = require("path");
  let queue = [];
  let alreadyImported = new Set();

  queue.push({cwd: workingDir, file: what});
  alreadyImported.add(solidifyName(what));
  while (queue.length > 0){
    const fileData = queue.shift()!;
    let tmp: ImportFile = await resolver.require(fileData.file, fileData.cwd);
    const foundImports = findImports(tmp);
    result.push(tmp);
    const filewd = path.dirname(tmp.path);
    for (let i in foundImports) {
      const solidifiedName: string = solidifyName(foundImports[i]);
      if (!alreadyImported.has(solidifiedName)) {
        alreadyImported.add(solidifiedName);
        queue.push({cwd: filewd, file: foundImports[i]});
      }
    }
  }

  return result;
}