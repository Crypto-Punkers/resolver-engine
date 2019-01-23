import Debug from "debug";
import { SubParser } from "./parsers/subparser";
import { ResolverContext, ResolverResult, SubResolver } from "./resolvers/subresolver";
import { firstResult, namedFirstResult } from "./utils";

const debug = Debug("resolverengine:main");

export interface Options {
  debug?: true;
}

// TODO find a better name
export interface ResolveResult extends ResolverResult {
  resolverName: string;
}

export interface RequireResult<R> extends ResolveResult {
  content: R;
}

export class ResolverEngine<R> {
  private resolvers: SubResolver[] = [];
  private parsers: SubParser<R>[] = [];

  constructor(options?: Options) {
    const opts: Options = { ...options };
    if (opts.debug) {
      Debug.enable("resolverengine:*");
      Debug("resolverengine:otherchannel")("Debugging mode is now enabled");
    }
  }

  // Takes a simplified name (URI) and converts into cannonical URL of the location
  public async resolve(uri: string, workingDir?: string): Promise<ResolveResult> {
    debug(`Resolving "${uri}"`);

    const ctx: ResolverContext = {
      cwd: workingDir,
    };

    const result = await namedFirstResult(this.resolvers, resolver => resolver(uri, ctx));

    if (result === null) {
      throw new Error(`None of the sub-resolvers resolved "${uri}" location.`);
    }

    debug(`Resolved "${uri}" into "${result[0]}" with ${result[1]}`);

    return {
      resourceName: result[0].resourceName,
      url: result[0].url,
      resolverName: result[1],
    };
  }

  public async require(uri: string, workingDir?: string): Promise<RequireResult<R>> {
    debug(`Requiring "${uri}"`);

    const resolved = await this.resolve(uri, workingDir);

    const result = await firstResult(this.parsers, parser => parser(resolved.url));

    if (result === null) {
      throw new Error(`None of the sub-parsers resolved "${uri}" into data. Please confirm your configuration.`);
    }

    return {
      resourceName: resolved.resourceName,
      url: resolved.url,
      resolverName: resolved.resolverName,
      content: result,
    };
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
