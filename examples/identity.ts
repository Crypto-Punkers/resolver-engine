import { ResolverEngine, FsParser, FsResolver } from "../src";

const resolver = new ResolverEngine<string>({ debug: true }).addResolver(new FsResolver()).addParser(new FsParser());

resolver.require(__filename).then(identity => console.log(identity.substr(0, 128)));
