import * as path from "path";
import { SubResolver } from ".";
import { FsResolver } from "./fsresolver";
import { ResolverContext, ResolverMetadata } from "./subresolver";

export function BacktrackFsResolver(pathPrefix: string = ""): SubResolver {
  const fsResolver = FsResolver();

  return async (resolvePath: string, ctx: ResolverContext): Promise<ResolverMetadata | null> => {
    if (path.isAbsolute(resolvePath)) {
      return null;
    }

    const cwd = ctx.cwd || process.cwd();

    let previous: string = path.resolve(cwd, "./");
    let current: string = previous;
    do {
      const result = await fsResolver(path.join(current, pathPrefix, resolvePath), ctx);

      if (result) {
        return result;
      }

      previous = current;
      current = path.join(current, "..");
    } while (current !== previous); // Reached root
    return null;
  };
}
