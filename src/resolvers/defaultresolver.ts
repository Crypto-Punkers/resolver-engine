import Debug from "debug";
import { ResolverContext, ResolverResult, SubResolver } from ".";

const debug = Debug("resolverengine:uriresolver");
// I think this name better reflects its usage -> its a fallback for when everything else fails
// and 'http' makes more sense than 'url'
export function DefaultResolver(): SubResolver {
  return async function http(uri: string, ctx: ResolverContext): Promise<ResolverResult | null> {
    debug("Resolving %s", uri);
    try {
      // this just checks if it follows a pattern of: "whatever://things:you@know.lori/stuff"
      const schemedUrl = new URL(uri).href;
      return { url: schemedUrl };
    } catch {
      return null;
    }
  };
}
