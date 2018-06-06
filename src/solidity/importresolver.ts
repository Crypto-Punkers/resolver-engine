import { FsParser, SubParser } from "../parsers";
import { ResolverEngine } from "../resolverengine";
import { FsResolver, GithubResolver, NodeResolver, UrlResolver } from "../resolvers";

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
  return (
    new ResolverEngine<ImportFile>()
      .addResolver(FsResolver())
      .addResolver(NodeResolver())
      .addResolver(GithubResolver())
      .addResolver(UrlResolver())
      // TODO(ritave): Add EthPM support
      .addParser(ImportParser())
  );
}
