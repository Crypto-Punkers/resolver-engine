import { ResolverEngine, NodeResolver } from "../src";

const resolver = new ResolverEngine<string>({ debug: true }).addResolver(new NodeResolver());

resolver.resolve("@types/request/index.d.ts").then(console.log);
