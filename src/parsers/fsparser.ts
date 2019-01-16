import Debug from "debug";
import * as fs from "fs";
import { SubParser } from ".";

// const readFileAsync = promisify(fs.readFile);
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
const NO_FILE = "ENOENT";

const debug = Debug("resolverengine:fsparser");

export function FsParser(): SubParser<string> {
  return async (path: string): Promise<string | null> => {
    try {
      return (await readFileAsync(path, "utf-8")).toString();
    } catch (e) {
      debug(`Error returned when trying to parse "${path}", returning null`, e);
      return null;
    }
  };
}
