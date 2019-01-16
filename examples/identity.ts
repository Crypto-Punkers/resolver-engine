import { FsParser } from "../src/parsers";
import { ResolverEngine } from "../src/resolverengine";
import { FsResolver } from "../src/resolvers";

const resolver = new ResolverEngine<string>({ debug: true }).addResolver(FsResolver()).addParser(FsParser());

resolver.require(__filename).then(identity => console.log(identity.substr(0, 128)));
