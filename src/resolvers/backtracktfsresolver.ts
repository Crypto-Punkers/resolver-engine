import * as path from "path";
import { FsResolver, ResolverContext, SubResolver } from "..";

export function BacktrackFsResolver(pathPrefix: string = ""): SubResolver {
  const fsResolver = FsResolver();

  return async (resolvePath: string, ctx: ResolverContext): Promise<string | null> => {
    if (path.isAbsolute(resolvePath)) {
      return null;
    }

    let previous: string = path.resolve(ctx.cwd, "./");
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
