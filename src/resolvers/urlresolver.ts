import Debug from "debug";
import * as fs from "fs";
import request from "request";
import * as tmp from "tmp";
import * as url from "url";
import { ResolverContext, SubResolver } from "..";

const debug = Debug("resolverengine:urlresolver");

function isValidUri(uri: string): boolean {
  return !!url.parse(uri).host;
}

export interface UrlResolverContext extends ResolverContext {
  options?: request.Options;
}

export function UrlResolver(): SubResolver {
  tmp.setGracefulCleanup();

  return (what: string, ctx: UrlResolverContext): Promise<string | null> =>
    new Promise((resolve, reject) => {
      if (!isValidUri(what)) {
        return resolve(null);
      }

      tmp.file((err, path, fd) => {
        if (err) {
          return reject(err);
        }
        debug("Created temporary file: ", path);

        const req = request({ url: what, ...ctx.options });
        req
          .on("response", response => {
            debug("Got response:", response.statusCode);
            if (response.statusCode >= 200 && response.statusCode <= 299) {
              req.pipe(fs.createWriteStream("", { autoClose: false, fd }));
            } else {
              reject(new Error(`${response.statusCode} ${response.statusMessage}`));
            }
          })
          .on("error", reject)
          .on("end", () => resolve(path));
      });
    });
}
