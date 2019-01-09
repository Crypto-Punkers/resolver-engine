import Debug from "debug";
import { getContext, ResolverContext } from "./context/resolver";
import { SubParser } from "./parsers/subparser";
import { SubResolver } from "./resolvers/subresolver";

const debug = Debug("resolverengine:main");

export interface Options {
  debug?: true;
}

export interface Explanation<R> {
  context: ResolverContext;

  resolver?: SubResolver;
  location?: string;

  parser?: SubParser<R>;
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

  public async resolve(what: string, workingDir?: string): Promise<string> {
    debug(`Resolving "${what}"`);
    const ctx: ResolverContext = getContext(workingDir);

    const [result] = await ResolverEngine.firstResult(this.resolvers, resolver => resolver(what, ctx));

    if (result === null) {
      throw new Error(`None of the sub-resolvers resolved "${what}" location.`);
    }

    debug(`Resolved "${what}" into "${result}"`);

    return result;
  }

  public async require(what: string, workingDir?: string): Promise<R> {
    debug(`Requiring "${what}"`);

    const path = await this.resolve(what, workingDir);

    const [result] = await ResolverEngine.firstResult(this.parsers, parser => parser(path));

    if (result === null) {
      throw new Error(`None of the sub-parsers resolved "${what}" into data. Please confirm your configuration.`);
    }

    return result;
  }

  public async explain(what: string, workingDir?: string): Promise<Explanation<R>> {
    debug(`Explaining "${what}"`);

    let explanation = {} as Explanation<R>;

    // above object will serve for debugging purposes
    // Debug.disable();

    await (async () => {
      const ctx: ResolverContext = getContext(workingDir);

      explanation.context = ctx;

      const [location, resolver] = await ResolverEngine.firstResult(this.resolvers, resolver => resolver(what, ctx));

      if (!location || !resolver) {
        return; // abruptly end execution
      }

      explanation.location = location;
      explanation.resolver = resolver;

      const [, parser] = await ResolverEngine.firstResult(this.parsers, parser => parser(location));

      if (!parser) {
        return;
      }

      explanation.parser = parser;
    })();

    // Debug.enable("resolverengine:*");

    debug("%s : %O", what, explanation);

    return explanation;
  }

  public addResolver(resolver: SubResolver): ResolverEngine<R> {
    this.resolvers.push(resolver);
    return this;
  }

  public addParser(parser: SubParser<R>): ResolverEngine<R> {
    this.parsers.push(parser);
    return this;
  }

  private static async firstResult<T, R>(
    things: T[],
    check: (thing: T) => Promise<R | null>,
  ): Promise<[R | null, T | null]> {
    for (const thing of things) {
      try {
        const result = await check(thing);
        if (result) {
          return [result, thing];
        }
      } catch (err) {
        // treat exceptions as just failed check (in case of 404's)
        debug("Exception occured on check: %O", err.message);
      }
    }
    return [null, null];
  }
}
