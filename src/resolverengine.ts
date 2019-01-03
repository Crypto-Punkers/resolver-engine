import Debug from "debug";
import * as process from "process";
import { SubParser } from "./parsers/subparser";
import { ResolverContext, SubResolver, IResolverServiceLayer } from "./resolvers/subresolver";
import request = require("request");
import tmp = require("tmp");
import fs = require("fs");
import http = require("http");
import { stringify } from "querystring";

const debug = Debug("resolverengine:main");

let environment: "node" | "browser" = "node";

(() => {
  if (typeof window !== 'undefined' && typeof module === 'undefined') {
    environment = "browser"
  }
})()

function getContext(workingDir?: string): ResolverContext {
  const cwd = workingDir || process.cwd(); // TODO: what about browser env?

  return {
    cwd: cwd,
    environment: environment,
    system: getSystem(environment),
  } as ResolverContext;
}

function getSystem(env: "node" | "browser"): IResolverServiceLayer {
  if (env === "browser") {
    return new BrowserService();
  } else {
    return new NodeService();
  }
}

class NodeService implements IResolverServiceLayer {
  constructor() {
    tmp.setGracefulCleanup();
  }

  requestGet(url: string, error: (err: Error) => void, response: (data: any) => void, end: () => void): void {
    http.get(url, (res) => {
      let buff = new Buffer("");
      res
        .on("error", error)
        .on("data", (chunk) => {
          buff.write(chunk.toString()); // I hope this works as I expect it to
        })
        .on("end", () => {
          response(buff);
          end();
        });
    })
    // const req = request({ url: url }); // TODO: add options capability
    // req
    //   .on("response", response)
    //   .on("error", error)
    //   // .on("pipe", ()) // TODO?
    //   .on("complete", end);
  }
  tmpFile(cb: (error: any, path: string, sink: (data: any) => void) => void): void {
    tmp.file((err, path, fd) => {
      const ws = fs.createWriteStream("", { autoClose: false, fd: fd });
      cb(err, path, (data: any) => {
        ws.write(data);
      })
    });
  }
}

class BrowserService implements IResolverServiceLayer {
  constructor() {
    // it has 'window' object available
    // let window: any;
    window["FS"] = new Map();
  }

  requestGet(url: string, error: (err: Error) => void, response: (data: any) => void, end: () => void): void {
    let req = new XMLHttpRequest();
    req.onerror = (evt) => {
      error(new Error(evt.toString()));
    }
    req.onabort = (evt) => {
      error(new Error(evt.toString()));
    }

    req.onload = (/* ignore incoming event */) => {
      response(req.responseText);
      end();
    }
    req.open("GET", url);
    req.send();
  }

  tmpFile(cb: (error: any, path: string, sink: (data: any) => void) => void): void {
    const newFile = (new Date()).getTime().toString();

    cb(null, newFile, (data: any) => {
      (window['FS'] as Map<string, any>).set(newFile, data)
    })
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

    const [result,] = await ResolverEngine.firstResult(this.resolvers, resolver => resolver(what, ctx));

    if (result === null) {
      throw new Error(`None of the sub-resolvers resolved "${what}" location.`);
    }

    debug(`Resolved "${what}" into "${result}"`);

    return result;
  }

  public async require(what: string, workingDir?: string): Promise<R> {
    debug(`Requiring "${what}"`);

    const path = await this.resolve(what, workingDir);

    const [result,] = await ResolverEngine.firstResult(this.parsers, parser => parser(path));

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

  private static async firstResult<T, R>(things: T[], check: (thing: T) => Promise<R | null>): Promise<[R | null, T | null]> {
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
