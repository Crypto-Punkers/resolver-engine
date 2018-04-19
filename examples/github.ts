import { ResolverEngine, FsParser, GithubResolver } from "../src";

const resolver = new ResolverEngine<string>({ debug: true })
  .addParser(new FsParser())
  .addResolver(new GithubResolver());

resolver.require("github:ritave/resolver-engine/examples/github.ts").then(console.log);
