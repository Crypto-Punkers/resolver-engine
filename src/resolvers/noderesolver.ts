import Debug from "debug";
import path from "path";
import { ResolverContext, SubResolver } from ".";

const debug = Debug("resolverengine:noderesolver");

export function NodeResolver(): SubResolver {
  return async (what: string, ctx?: ResolverContext): Promise<string | null> => {
    try {
      let requirePaths: string[] = [];
      let currentPath = ctx ? ctx.cwd || process.cwd() : process.cwd();
      let lastPath: string = "";
      do {
        requirePaths.push(currentPath);
        lastPath = currentPath;
        currentPath = path.dirname(currentPath);
      } while (currentPath !== lastPath);
      return require.resolve(what, { paths: requirePaths });
    } catch (e) {
      debug("Node's require.resolve failed, returning null", e);
      return null;
    }
  };
}
