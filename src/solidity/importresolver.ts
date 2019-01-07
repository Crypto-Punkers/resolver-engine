import {
  EthPmResolver,
  FsParser,
  FsResolver,
  GithubResolver,
  NodeResolver,
  ResolverEngine,
  SubParser,
  UrlResolver,
} from "..";

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

// WIP
export function BrowserImportResolver() {
  return new ResolverEngine<ImportFile>({ debug: true })
    .addParser(ImportParser())
    .addResolver(FsResolver())
    .addResolver(GithubResolver())
    .addResolver(UrlResolver());
}
