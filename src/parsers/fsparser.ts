import Debug from "debug";
import { FSWrapper, SubParser } from "..";

const debug = Debug("resolverengine:fsparser");

export function FsParser(_fs: FSWrapper = require("fs")): SubParser<string> {
  return async (path: string): Promise<string | null> =>
    new Promise<string | null>(resolve => {
      debug("Reading file %s", path);
      // const contents = await readFileAsync(path, "utf-8");
      _fs.readFile(path, { encoding: "utf8" }, (err, contents) => {
        if (err) {
          debug(`Error returned when trying to parse "${path}", returning null`, err);
          return resolve(null);
        }
        debug("Read file! Length %d", contents.length);

        return resolve(contents.toString());
      });
    });
}
