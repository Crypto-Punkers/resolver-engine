import Debug from "debug";
import * as path from "path";
import { SubResolver } from ".";
import { FsResolver } from "./fsresolver";
import { ResolverContext } from "./subresolver";
const debug = Debug("resolverengine:backtrackfsresolver");

export function BacktrackFsResolver(pathPrefix: string = ""): SubResolver {
  const fsResolver = FsResolver();

  return async (resolvePath: string, ctx?: ResolverContext): Promise<string | null> => {
    if (path.isAbsolute(resolvePath)) {
      return null;
    }

    const cwd = ctx ? ctx.cwd || process.cwd() : process.cwd();

    let previous: string = path.resolve(cwd, "./");
    let current: string = previous;
    do {
      const shotInTheDark = path.join(current, pathPrefix, resolvePath);
      debug("Trying %s as %s", resolvePath, shotInTheDark);
      const result = await fsResolver(shotInTheDark, ctx);

      if (result) {
        return result;
      }

      previous = current;
      current = path.join(current, "..");
    } while (current !== previous); // Reached root
    return null;
  };
}
