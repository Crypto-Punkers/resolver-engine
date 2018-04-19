import * as fs from "fs";
import * as path from "path";

import { SubResolver } from "./subresolver";
import { promisify } from "util";

const statAsync = promisify(fs.stat);
const NO_FILE = "ENOENT";

export class FsResolver implements SubResolver {
  private readonly root: string;

  public constructor(root?: string) {
    this.root = root || "";
  }

  async resolve(what: string): Promise<string | null> {
    let myWhat = what;
    if (path.isAbsolute(myWhat)) {
      myWhat = this.root + myWhat;
    }

    try {
      const stats = await statAsync(myWhat);
      return stats.isFile() ? myWhat : null;
    } catch (e) {
      if (e.code === NO_FILE) {
        return null;
      }
      throw e;
    }
  }
}
