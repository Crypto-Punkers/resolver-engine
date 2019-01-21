import { FsParser } from "../parsers";
import { UrlParser } from "../parsers/urlparser";
import { Options, ResolverEngine } from "../resolverengine";
import { FsResolver, GithubResolver, IPFSResolver, NodeResolver, SwarmResolver, UriResolver } from "../resolvers";
import { EthPmResolver } from "./ethpmresolver";
import { ImportFile, ImportParser } from "./importparser";

export function SolidityImportResolver(options?: Options) {
  return new ResolverEngine<ImportFile>(options)
    .addResolver(GithubResolver())
    .addResolver(UriResolver())
    .addResolver(FsResolver())
    .addResolver(EthPmResolver())
    .addResolver(NodeResolver())
    .addParser(ImportParser([FsParser(), UrlParser()]));
}

export function BrowserImportResolver(options?: Options) {
  return new ResolverEngine<ImportFile>(options)
    .addResolver(GithubResolver())
    .addResolver(UriResolver())
    .addResolver(IPFSResolver())
    .addResolver(SwarmResolver())
    .addParser(ImportParser([UrlParser()]));
}
