import Debug from "debug";
import { ResolverContext, SubResolver } from ".";

const debug = Debug("resolverengine:uriresolver");
// I think this name better reflects its usage -> its a fallback for when everything else fails
// and 'http' makes more sense than 'url'
export function DefaultResolver(): SubResolver {
  return async function http(uri: string, ctx: ResolverContext): Promise<string | null> {
    debug("Resolving %s", uri);
    try {
      // this just checks if it follows a pattern of: "whatever://things:you@know.lori/stuff"
      return new URL(uri).href;
    } catch {
      return null;
    }
  };
}
