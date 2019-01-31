import { ResolverEngine, resolvers, parsers } from "@resolver-engine/core";

const resolver = new ResolverEngine<string>({ debug: true }).addParser(parsers.UrlParser()).addResolver(resolvers.UriResolver());

resolver
  .require("https://www.apple.com/library/test/success.html")
  .then(console.log);
