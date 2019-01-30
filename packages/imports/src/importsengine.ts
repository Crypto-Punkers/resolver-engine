import { ResolverEngine, UriResolver, UrlParser } from "@resolver-engine/core";
import { ImportFile, ImportParser } from "./parsers/importparser";
import { GithubResolver } from "./resolvers/githubresolver";
import { IPFSResolver } from "./resolvers/ipfsresolver";
import { SwarmResolver } from "./resolvers/swarmresolver";

export function ImportsEngine(): ResolverEngine<ImportFile> {
  return (
    new ResolverEngine<ImportFile>()
      //.addResolver(FsResolver())
      //.addResolver(EthPmResolver())
      //.addResolver(NodeResolver())
      .addResolver(GithubResolver())
      .addResolver(SwarmResolver())
      .addResolver(IPFSResolver())
      .addResolver(UriResolver())
      .addParser(ImportParser([UrlParser()]))
  );
}
