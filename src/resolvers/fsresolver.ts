// import * as fs from "fs";
import * as path from "path";
// import { promisify } from "util";
import { SubResolver } from ".";
import { ResolverContext } from "..";

const NO_FILE = "ENOENT";

export function FsResolver(): SubResolver {
  return async (resolvePath: string, ctx: ResolverContext): Promise<string | null> => {
    // const statAsync = promisify(ctx.system.fs.stat);

    let myPath: string;
    if (!path.isAbsolute(resolvePath)) {
      myPath = path.join(ctx.cwd, resolvePath);
    } else {
      myPath = resolvePath;
    }

    return new Promise<string | null>((resolve, reject) => {
      ctx.system.fs.stat(myPath, (error, stats) => {
        if (error) {
          if (error.code === NO_FILE) {
            resolve(null);
          } else {
            reject(error);
          }
        }

        if (!stats) {
          resolve(null);
        }

        return stats!.isFile() ? myPath : null;
      })
    });
  };
}
