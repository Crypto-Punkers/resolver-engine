import { NodeResolver, ResolverEngine } from "../src";

const resolver = new ResolverEngine<string>({ debug: true }).addResolver(NodeResolver());

resolver.resolve("@types/request/index.d.ts").then(console.log);
