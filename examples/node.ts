import { ResolverEngine, resolvers } from "@openzeppelin/resolver-engine-fs";

const resolver = new ResolverEngine<string>({ debug: true }).addResolver(resolvers.NodeResolver());

resolver.resolve("@types/request/index.d.ts").then(console.log);
