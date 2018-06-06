import Debug from "debug";
import { SubParser } from "./parsers/subparser";
import { SubResolver } from "./resolvers/subresolver";

const debug = Debug("resolverengine:main");

export interface Options {
  debug?: true;
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

  public async resolve(what: string): Promise<string> {
    debug(`Resolving "${what}"`);

    const result = await ResolverEngine.firstResult(this.resolvers, resolver => resolver(what));

    if (result === null) {
      throw new Error(`None of the sub-resolvers resolved "${what}" location.`);
    }

    debug(`Resolved "${what}" into "${result}"`);

    return result;
  }

  public async require(what: string): Promise<R> {
    debug(`Requiring "${what}"`);

    const path = await this.resolve(what);

    const result = await ResolverEngine.firstResult(this.parsers, parser => parser(path));

    if (result === null) {
      throw new Error(`None of the sub-parsers resolved "${what}" into data. Please confirm your configuration.`);
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

  private static async firstResult<T, R>(things: T[], check: (thing: T) => Promise<R | null>): Promise<R | null> {
    for (const thing of things) {
      const result = await check(thing);
      if (result) {
        return result;
      }
    }
    return null;
  }
}
