import { BrowserService, IResolverServiceLayer, NodeService } from "./service";

export type env_t = "node" | "browser" | "test";
let environment: env_t = "node";

// experiment
(() => {
  if (typeof window !== "undefined" && typeof module === "undefined") {
    environment = "browser";
  }
})();

export interface ResolverContext {
  cwd: string;
  environment: env_t;
  system: IResolverServiceLayer;
}

export function getContext(workingDir?: string): ResolverContext {
  const cwd = workingDir || process.cwd(); // TODO: what about browser env?

  return {
    cwd: cwd,
    environment: environment,
    system: getSystem(environment),
  } as ResolverContext;
}

function getSystem(env: env_t): IResolverServiceLayer {
  if (env === "browser") {
    return new BrowserService();
  } else {
    return new NodeService();
  }
}
