import { FsParser, ResolverEngine, UrlResolver } from "../src";

const resolver = new ResolverEngine<string>({ debug: true }).addParser(FsParser()).addResolver(UrlResolver());

resolver
  .require("https://raw.githubusercontent.com/ritave/resolver-engine/master/examples/network.ts")
  .then(console.log);
