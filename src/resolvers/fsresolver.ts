import Debug from "debug";
import * as fs from "fs";
import * as path from "path";
import { SubResolver } from ".";
import { ResolverContext, ResolverMetadata } from "./subresolver";
const debug = Debug("resolverengine:fsresolver");

const statAsync = (path: string): Promise<fs.Stats> =>
  new Promise<fs.Stats>((resolve, reject) => {
    fs.stat(path, (err, stats) => {
      if (err) {
        reject(err);
      }

      resolve(stats);
    });
  });
const NO_FILE = "ENOENT";

export function FsResolver(): SubResolver {
  return async function fs(resolvePath: string, ctx: ResolverContext): Promise<ResolverMetadata | null> {
    debug("Resolving %s", resolvePath);
    const cwd = ctx.cwd || process.cwd();

    let myPath: string;
    if (!path.isAbsolute(resolvePath)) {
      myPath = path.join(cwd, resolvePath);
    } else {
      myPath = resolvePath;
    }
    try {
      const stats = await statAsync(myPath);
      return stats.isFile() ? { url: myPath } : null;
    } catch (e) {
      if (e.code === NO_FILE) {
        return null;
      }
      throw e;
    }
  };
}
