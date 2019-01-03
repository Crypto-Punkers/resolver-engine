import Debug from "debug";
import * as fs from "fs";
import { promisify } from "util";
import { SubParser } from ".";

const readFileAsync = promisify(fs.readFile);

const debug = Debug("resolverengine:fsparser");

export function FsParser(): SubParser<string> {
  return async (path: string): Promise<string | null> => {
    try {
      debug("Reading file %s", path);
      const contents = await readFileAsync(path, "utf-8");
      debug("Read file! Length %d", contents.length);
      const text = contents.toString();
      debug("%s", text);
      return text;
    } catch (e) {
      debug(`Error returned when trying to parse "${path}", returning null`, e);
      return null;
    }
  };
}
