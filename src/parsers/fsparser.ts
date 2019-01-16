import Debug from "debug";
import * as fs from "fs";
import { SubParser } from ".";

const debug = Debug("resolverengine:fsparser");

const readFileAsync = (
  path: fs.PathLike | number,
  options?: { encoding?: string | null; flag?: string } | string | null,
): Promise<string | Buffer> =>
  new Promise<string | Buffer>((resolve, reject) => {
    fs.readFile(path, options, (err, data) => {
      if (err) {
        reject(err);
      }

      resolve(data);
    });
  });

export function FsParser(): SubParser<string> {
  return async (path: string): Promise<string | null> => {
    debug("Parsing %s", path);
    try {
      return (await readFileAsync(path, "utf-8")).toString();
    } catch (e) {
      return null;
    }
  };
}
