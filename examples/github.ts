import { FsParser, GithubResolver, ResolverEngine } from "../src";

const resolver = new ResolverEngine<string>({ debug: true }).addParser(FsParser()).addResolver(GithubResolver());

resolver.require("github:ritave/resolver-engine/examples/github.ts").then(console.log);
