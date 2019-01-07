import * as path from "path";
import { ResolverContext, SubResolver } from "..";

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
          return;
        }

        if (!stats) {
          return resolve(null);
        }

        return resolve(stats.isFile() ? myPath : null);
      });
    });
  };
}
