import { FsParser } from "../parsers";
import { UrlParser } from "../parsers/urlparser";
import { Options, ResolverEngine } from "../resolverengine";
import { FsResolver, GithubResolver, NodeResolver, UriResolver } from "../resolvers";
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
