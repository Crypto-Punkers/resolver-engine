import Debug from "debug";
import { ResolverContext, SubResolver } from ".";

const debug = Debug("resolverengine:uriresolver");
export function UriResolver(): SubResolver {
  return async function url(uri: string, ctx: ResolverContext): Promise<string | null> {
    debug("Resolving %s", uri);
    try {
      return new URL(uri).href;
    } catch {
      return null;
    }
  };
}
