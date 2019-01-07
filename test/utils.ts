import { BrowserService, env_t, IResolverServiceLayer, NodeService, ResolverContext } from "../src";

export function defaultContext(environment: env_t): ResolverContext {
  return {
    cwd: process.cwd(),
    environment: environment,
    system: getSystem(environment),
  } as ResolverContext;
}

function getSystem(env: env_t): IResolverServiceLayer {
  if (env === "browser") {
    return new BrowserService();
  } else {
    return new NodeService("test");
  }
}
