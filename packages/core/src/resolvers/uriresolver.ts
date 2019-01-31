import { Context } from "..";
import { SubResolver } from "./subresolver";

export function UriResolver(): SubResolver {
  // TODO: make a resolver that actually checks if something is a valid http link
  return async function http(uri: string, ctx: Context): Promise<string | null> {
    try {
      return new URL(uri).href;
    } catch {
      return null;
    }
  };
}
