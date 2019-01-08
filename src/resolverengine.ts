import Debug from "debug";
import * as process from "process";
import { FSWrapper } from "./context/fs";
import { SubParser } from "./parsers/subparser";
import { SubResolver } from "./resolvers/subresolver";
import tmp = require("tmp");
import request = require("request");

const debug = Debug("resolverengine:main");

export type env_t = "node" | "browser" | "test"; // "test" implies "node"
let environment: env_t = "node";

(() => {
  if (typeof window !== "undefined" && typeof module === "undefined") {
    environment = "browser";
  }
})();

export interface ResolverContext {
  cwd: string;
  environment: env_t;
  system: IResolverServiceLayer;
}

export interface IResolverServiceLayer {
  // these two won't get their own wrappers because of cross-dependency
  requestGet(url: string, error: (err: Error) => void, response: (data: any) => void, end: () => void): void;
  tmpFile(cb: (error: any, path: string, sink: (data: any) => void) => void): void;

  fs: FSWrapper;
}

function getContext(workingDir?: string): ResolverContext {
  const cwd = workingDir || process.cwd(); // TODO: what about browser env?

  return {
    cwd: cwd,
    environment: environment,
    system: getSystem(environment),
  } as ResolverContext;
}

function getSystem(env: env_t): IResolverServiceLayer {
  if (env === "browser" || env === "test") {
    return new BrowserService();
  } else {
    return new NodeService();
  }
}

export class NodeService implements IResolverServiceLayer {
  // private maxBuffSize: number;
  public fs: FSWrapper; // we will be using intersection of both

  constructor() {
    tmp.setGracefulCleanup();
    // this.maxBuffSize = 69 * 1024; // 69kB

    this.fs = require("fs");
  }

  requestGet(url: string, error: (err: Error) => void, response: (data: any) => void, end: () => void): void {
    debug("Requesting %s", url);
    request.get(url, undefined, (err, resp, body) => {
      if (err) {
        error(err);
        return end();
      }
      response(body);
      return end();
    });
    // http.get(url, res => {
    //   // let buff = new Buffer("");
    //   let buff = Buffer.alloc(this.maxBuffSize);
    //   res
    //     .on("error", error)
    //     .on("data", chunk => {
    //       debug("Writing data chunk %O", chunk);
    //       buff.write(chunk.toString()); // I hope this works as I expect it to
    //     })
    //     .on("end", () => {
    //       debug("Ending request");
    //       response(buff);
    //       end();
    //     });
    // });
  }

  tmpFile(cb: (error: any, path: string, sink: (data: any) => void) => void): void {
    tmp.file((err, path, fd) => {
      debug("Creating write stream to file %s", path);
      const ws = this.fs.createWriteStream("", { autoClose: false, fd: fd });
      cb(err, path, (data: any) => {
        debug("Writing to stream");
        ws.write(data, () => {
          debug("Closing stream");
          ws.close();
        });
      });
    });
  }
}

export class BrowserService implements IResolverServiceLayer {
  public fs: FSWrapper;

  constructor() {
    this.fs = require("memfs");
  }

  requestGet(url: string, error: (err: Error) => void, response: (data: any) => void, end: () => void): void {
    let req = new XMLHttpRequest();
    req.onerror = evt => {
      error(new Error(evt.toString()));
    };
    req.onabort = evt => {
      error(new Error(evt.toString()));
    };

    req.onload = (/* ignore incoming event */) => {
      response(req.responseText);
      end();
    };
    req.open("GET", url);
    req.send();
  }

  tmpFile(cb: (error: any, path: string, sink: (data: any) => void) => void): void {
    const newFile = new Date().getTime().toString();

    cb(null, newFile, (data: any) => {
      (window["FS"] as Map<string, any>).set(newFile, data);
    });
  }
}

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
