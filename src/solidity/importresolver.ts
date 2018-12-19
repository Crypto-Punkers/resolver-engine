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

export async function gatherSources(what: string, workingDir?: string, resolver: ResolverEngine<ImportFile> = SolidityImportResolver()): Promise<ImportFile[]> {
  let result: ImportFile[] = [];
  const path = require("path");

  let queue = [];

  queue.push({cwd: workingDir, file: what});

  while (queue.length > 0){
    const fileData = queue.shift()!;
    let tmp: ImportFile = await resolver.require(fileData.file, fileData.cwd); //TODO try
    const foundImports = findImports(tmp);
    console.log(foundImports);
    //TODO check if file was already resolved
    result.push(tmp);
    const filewd = path.dirname(tmp.path);
    for (let i in foundImports) {
      queue.push({cwd: filewd, file: foundImports[i]});
    }
  }

  return result;
}