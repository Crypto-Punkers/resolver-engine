import { FsParser } from "../parsers";
import { UrlParser } from "../parsers/urlparser";
import { ResolverEngine } from "../resolverengine";
import { FsResolver, GithubResolver, NodeResolver, UriResolver } from "../resolvers";
import { EthPmResolver } from "./ethpmresolver";
import { ImportFile, ImportParser } from "./importparser";

export function SolidityImportResolver() {
  return new ResolverEngine<ImportFile>()
    .addResolver(FsResolver())
    .addResolver(EthPmResolver())
    .addResolver(NodeResolver())
    .addResolver(GithubResolver())
    .addResolver(UriResolver())
    .addParser(ImportParser([FsParser(), UrlParser()]));
}
