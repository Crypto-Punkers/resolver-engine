import Debug from "debug";
import { SubParser } from "./parsers/subparser";
import { SubResolver } from "./resolvers/subresolver";
import { contextualizedFirstResult, firstResult } from "./utils";

const debug = Debug("resolverengine:main");

export interface Options {
  debug?: true;
}

export interface Context {
  resolver: string;
  cwd?: string;
}

export class ResolverEngine<R> {
  private resolvers: SubResolver[] = [];
  private parsers: SubParser<R>[] = [];

  constructor(options?: Options) {
    const opts: Options = { ...options };
    if (opts.debug) {
      Debug.enable("resolverengine:*");
    }
  }

  // Takes a simplified name (URI) and converts into cannonical URL of the location
  public async resolve(uri: string, workingDir?: string): Promise<string> {
    debug(`Resolving "${uri}"`);

    let ctx: Context = {
      cwd: workingDir,
      resolver: "unknown",
    };

    const result = await firstResult(this.resolvers, resolver => resolver(uri, ctx));

    if (result === null) {
      throw new Error(`None of the sub-resolvers resolved "${uri}" location.`);
    }

    debug(`Resolved "${uri}" into "${result}"`);

    return result;
  }

  public async require(uri: string, workingDir?: string): Promise<R> {
    debug(`Requiring "${uri}"`);

    let ctx: Context = {
      resolver: "unknown",
      cwd: workingDir,
    };

    // last context retrieves the resolver used for resolving the uri
    const url = await contextualizedFirstResult(this.resolvers, resolver => resolver(uri, ctx), ctx);

    if (url === null) {
      throw new Error(`None of the sub-resolvers resolved "${uri}" location.`); // FIXME, code duplication
    }

    const result = await firstResult(this.parsers, parser => parser(url, ctx));

    if (result === null) {
      throw new Error(`None of the sub-parsers resolved "${uri}" into data. Please confirm your configuration.`);
    }

    return result;
  }

  public addResolver(resolver: SubResolver): ResolverEngine<R> {
    this.resolvers.push(resolver);
    return this;
  }

  public addParser(parser: SubParser<R>): ResolverEngine<R> {
    this.parsers.push(parser);
    return this;
  }
}
