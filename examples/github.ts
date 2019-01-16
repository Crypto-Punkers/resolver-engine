import { UrlParser } from "../src/parsers";
import { ResolverEngine } from "../src/resolverengine";
import { GithubResolver } from "../src/resolvers";

const resolver = new ResolverEngine<string>({ debug: true }).addParser(UrlParser()).addResolver(GithubResolver());

resolver.require("github:crypto-punkers/resolver-engine/examples/github.ts").then(console.log);
