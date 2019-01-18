import Debug from "debug";
import { ResolverContext, SubResolver } from ".";
import { BacktrackFsResolver } from "./backtrackfsresolver";

const debug = Debug("resolverengine:noderesolver");
export function NodeResolver(): SubResolver {
  const backtrack = BacktrackFsResolver("node_modules");

  return async (what: string, ctx: ResolverContext): Promise<string | null> => {
    debug("Resolving %s", what);
    return backtrack(what, ctx);
  };
}
