import { Context, firstResult, SubParser } from "@resolver-engine/core";
import Debug from "debug";

const debug = Debug("resolverengine:importparser");

export interface ImportFile {
  url: string;
  source: string;
  provider: string;
  //internalImportURis: string[];
}

export function ImportParser(sourceParsers: SubParser<string>[]): SubParser<ImportFile> {
  return async (url: string, ctx: Context): Promise<ImportFile | null> => {
    const source = await firstResult(sourceParsers, parser => parser(url, ctx));
    if (!source) {
      debug(`Can't find source for ${url}`);
      return null;
    }
    const provider = ctx.resolver;
    return {
      url,
      source: source.result,
      provider,
    };
  };
}
