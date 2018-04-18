import { ResolverEngine, FsParser, UrlResolver } from "../src";

const resolver = new ResolverEngine<string>({ debug: true }).addParser(new FsParser()).addResolver(new UrlResolver());

resolver.require("https://pastebin.com/raw/D8ziKX0a").then(console.log);
