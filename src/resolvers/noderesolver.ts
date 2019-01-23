import Debug from "debug";
import { ResolverContext, SubResolver } from ".";
import { BacktrackFsResolver } from "./backtrackfsresolver";
import { ResolverResult } from "./subresolver";

const debug = Debug("resolverengine:noderesolver");
export function NodeResolver(): SubResolver {
  const backtrack = BacktrackFsResolver("node_modules");

  return async function node(what: string, ctx: ResolverContext): Promise<ResolverResult | null> {
    debug("Resolving %s", what);
    return backtrack(what, ctx);
  };
}
