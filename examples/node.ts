import { ResolverEngine } from "../src/resolverengine";
import { NodeResolver } from "../src/resolvers";

const resolver = new ResolverEngine<string>({ debug: true }).addResolver(NodeResolver());

resolver.resolve("@types/request/index.d.ts").then(console.log);
