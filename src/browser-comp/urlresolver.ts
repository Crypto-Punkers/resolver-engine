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
      // TODO: url check
      if (1 < 0) {
        return resolve(null);
      }

      ctx.system.tmpFile((err, path, fd) => {
        if (err) {
          return reject(err);
        }

        ctx.system.requestGet(
          what,
          err => {
            debug("Received error", err);
            resolve(null);
          },
          (data: any) => {
            debug("Received data %O", data);
            let ws = ctx.system.fs.createWriteStream("", { fd: fd });
            ws.write(data, () => {
              ws.close();
              resolve(path);
            });
          },
          () => {},
        );
      });
    });
}
