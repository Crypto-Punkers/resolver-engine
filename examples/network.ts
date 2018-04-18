import { ResolverEngine, FsParser, UrlResolver } from "../src";

const resolver = new ResolverEngine<string>({ debug: true }).addParser(new FsParser()).addResolver(new UrlResolver());

resolver
  .require("https://raw.githubusercontent.com/ritave/resolver-engine/master/examples/network.ts")
  .then(console.log);
