import { FsParser } from "../src/parsers";
import { ResolverEngine } from "../src/resolverengine";
import { UriResolver } from "../src/resolvers";

const resolver = new ResolverEngine<string>({ debug: true }).addParser(FsParser()).addResolver(UriResolver());

resolver
  .require("https://raw.githubusercontent.com/ritave/resolver-engine/master/examples/network.ts")
  .then(console.log);
