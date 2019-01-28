import { GithubResolver, ResolverEngine } from "../src";
import { UrlParser } from "../src/parsers/urlparser";

const resolver = new ResolverEngine<string>({ debug: true }).addParser(UrlParser()).addResolver(GithubResolver());

resolver.require("github:crypto-punkers/resolver-engine/examples/github.ts").then(console.log);
