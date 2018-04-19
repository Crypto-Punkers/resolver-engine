import * as fs from "fs";
import Debug from "debug";

import { promisify } from "util";

import { SubParser } from "./subparser";

const readFileAsync = promisify(fs.readFile);

const debug = Debug("resolverengine:fsparser");

export class FsParser implements SubParser<string> {
  async require(path: string): Promise<string | null> {
    try {
      return (await readFileAsync(path, "utf-8")).toString();
    } catch (e) {
      debug(`Error returned when trying to parse "${path}", returning null`, e);
      return null;
    }
  }
}
