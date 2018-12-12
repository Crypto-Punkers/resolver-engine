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

export function findImports<R extends ImportFile>(data: R) : string[] {
  let result: string[] = [];
  const regex: RegExp = /import \"([^\"]+)\";/g;
  let match: RegExpExecArray | null;
  while (match = regex.exec(data.source)) {
    result.push(match[1]);
    console.log(match);
  }
  return result;
}

export async function gatherSources<R extends ImportFile>(what: string, workingDir?: string, resolver?: ResolverEngine<R>): Promise<R[]> {
//  resolver || (resolver = SolidityImportResolver());
  let result: R[] = [];

  if (!resolver) //TODO resolver should default to SolidityImportResolver()
    throw Error("No resolver provided!");

  let queue = [];

  queue.push({cwd: workingDir, file: what});

  while (queue.length > 0){
    const fileData = queue.shift()!;
    let tmp: R = await resolver.require(fileData.file, fileData.cwd);
    const foundImports = findImports(tmp);
    console.log(foundImports);
    result.push(tmp);
    //TODO add found imports to queue 
  }

  return result;
}