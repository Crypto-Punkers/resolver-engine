import { FsParser } from "../src/parsers";
import { ResolverEngine } from "../src/resolverengine";
import { DefaultResolver } from "../src/resolvers";

const resolver = new ResolverEngine<string>({ debug: true }).addParser(FsParser()).addResolver(DefaultResolver());

resolver
  .require("https://raw.githubusercontent.com/ritave/resolver-engine/master/examples/network.ts")
  .then(console.log);
