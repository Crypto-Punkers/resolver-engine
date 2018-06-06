import * as fs from "fs";
import * as path from "path";
import { promisify } from "util";
import { SubResolver } from ".";

const statAsync = promisify(fs.stat);
const NO_FILE = "ENOENT";

export function FsResolver(root?: string): SubResolver {
  return async (resolvePath: string): Promise<string | null> => {
    let myPath = path.join(root || "", resolvePath);
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
