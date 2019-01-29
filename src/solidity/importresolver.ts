import { FsParser } from "../parsers";
import { UrlParser } from "../parsers/urlparser";
import { Options, ResolverEngine } from "../resolverengine";
import { DefaultResolver, FsResolver, GithubResolver, IPFSResolver, NodeResolver, SwarmResolver } from "../resolvers";
import { EthPmResolver } from "./ethpmresolver";
import { ImportFile, ImportParser } from "./importparser";

export function SolidityImportResolver(options?: Options) {
  return new ResolverEngine<ImportFile>(options)
    .addResolver(GithubResolver())
    .addResolver(FsResolver())
    .addResolver(EthPmResolver())
    .addResolver(NodeResolver())
    .addResolver(DefaultResolver())
    .addParser(ImportParser([FsParser(), UrlParser()]));
}

export function BrowserImportResolver(options?: Options) {
  return new ResolverEngine<ImportFile>(options)
    .addResolver(GithubResolver())
    .addResolver(IPFSResolver())
    .addResolver(SwarmResolver())
    .addResolver(DefaultResolver())
    .addParser(ImportParser([UrlParser()]));
}
