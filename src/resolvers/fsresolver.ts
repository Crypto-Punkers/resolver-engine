import * as fs from "fs";
import * as path from "path";
import { promisify } from "util";
import { SubResolver } from ".";
import { ResolverContext } from "./subresolver";

const statAsync = promisify(fs.stat);
const NO_FILE = "ENOENT";

export function FsResolver(): SubResolver {
  return async (resolvePath: string, ctx: ResolverContext): Promise<string | null> => {
    const cwd: string = ctx.cwd || process.cwd();

    let myPath: string;
    if (!path.isAbsolute(resolvePath)) {
      myPath = path.join(cwd, resolvePath);
    } else {
      myPath = resolvePath;
    }
    try {
      const stats = await statAsync(myPath);
      return stats.isFile() ? myPath : null;
    } catch (e) {
      if (e.code === NO_FILE) {
        return null;
      }
      throw e;
    }
  };
}
