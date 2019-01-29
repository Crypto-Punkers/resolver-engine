import { FsParser, FsResolver, ResolverEngine } from "../src";

const resolver = new ResolverEngine<string>({ debug: true }).addResolver(FsResolver()).addParser(FsParser());

resolver.require(__filename).then(identity => console.log(identity.substr(0, 128)));
