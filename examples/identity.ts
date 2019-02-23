import { parsers, ResolverEngine, resolvers } from "@resolver-engine/fs";

const resolver = new ResolverEngine<string>({ debug: true })
  .addResolver(resolvers.FsResolver())
  .addParser(parsers.FsParser());

resolver.require(__filename).then(identity => console.log(identity.substr(0, 128)));
