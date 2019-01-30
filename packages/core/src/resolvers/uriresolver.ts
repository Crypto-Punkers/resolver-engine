import { SubResolver } from ".";
import { Context } from "..";

export function UriResolver(): SubResolver {
  return async function url(uri: string, ctx: Context): Promise<string | null> {
    try {
      return new URL(uri).href;
    } catch {
      return null;
    }
  };
}
