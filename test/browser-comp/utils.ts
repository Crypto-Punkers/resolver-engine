import { ResolverContext, IResolverServiceLayer, BrowserService, NodeService } from "../../src";

export function defaultContext(environment: "node" | "browser"): ResolverContext {
	return {
		cwd: process.cwd(),
		environment: environment,
		system: getSystem(environment),
	} as ResolverContext;
}

function getSystem(env: "node" | "browser"): IResolverServiceLayer {
	if (env === "browser") {
		return new BrowserService();
	} else {
		return new NodeService();
	}
}
