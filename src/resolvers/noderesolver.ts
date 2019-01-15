import { ResolverContext, SubResolver } from ".";
import { BacktrackFsResolver } from "./backtrackfsresolver";

export function NodeResolver(): SubResolver {
  const backtrack = BacktrackFsResolver("node_modules");

  return async (what: string, ctx?: ResolverContext): Promise<string | null> => {
    return backtrack(what, ctx);
  };
}
