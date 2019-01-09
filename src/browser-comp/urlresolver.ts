import Debug from "debug";
import { ResolverContext } from "../context";
import { SubResolver } from "../resolvers";

const debug = Debug("resolverengine:urlresolver2");

export interface BrowserCompatibleUrlResolverContext extends ResolverContext {
  // options?: request.Options;
}

// Proof of concept
export function BrowserCompatibleUrlResolver(): SubResolver {
  return (what: string, ctx: BrowserCompatibleUrlResolverContext): Promise<string | null> =>
    new Promise((resolve, reject) => {
      let url: URL;
      try {
        url = new URL(what);
      } catch (err) {
        return resolve(null);
      }

      ctx.system.tmpFile((err, path, fd) => {
        if (err) {
          return reject(err);
        }

        ctx.system.requestGet(
          url.href,
          err => {
            debug("Received error", err);
            reject(err);
          },
          (data: any) => {
            debug("Received data %O", data);
            let ws = ctx.system.fs.createWriteStream("", { fd: fd });
            ws.write(data, () => {
              resolve(path);
            });
          },
          () => {},
        );
      });
    });
}
