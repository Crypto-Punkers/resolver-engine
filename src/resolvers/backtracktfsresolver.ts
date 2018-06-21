import * as path from "path";
import { SubResolver } from ".";
import { FsResolver } from "./fsresolver";

export function BacktrackFsResolver(pathPrefix: string = ""): SubResolver {
  const fsResolver = FsResolver();

  return async (resolvePath: string): Promise<string | null> => {
    if (path.isAbsolute(resolvePath)) {
      return null;
    }

    let previous: string = path.resolve("./");
    let current: string = previous;
    do {
      const result = await fsResolver(path.join(current, pathPrefix, resolvePath));

      if (result) {
        return result;
      }

      previous = current;
      current = path.join(current, "..");
    } while (current !== previous); // Reached root
    return null;
  };
}
