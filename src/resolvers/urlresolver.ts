import Debug from "debug";
import * as fs from "fs";
import request from "request";
import * as tmp from "tmp";
import { SubResolver } from ".";

const debug = Debug("resolverengine:urlresolver");

export function UrlResolver(): SubResolver {
  tmp.setGracefulCleanup();

  return (what: string, options?: request.Options): Promise<string | null> =>
    new Promise((resolve, reject) => {
      tmp.file((err, path, fd) => {
        if (err) {
          reject(err);
        }
        debug("Created temporary file: ", path);

        const req = request({ url: what, ...options });
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
