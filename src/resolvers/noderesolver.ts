import Debug from "debug";
import { SubResolver } from ".";

const debug = Debug("resolverengine:noderesolver");

export function NodeResolver(): SubResolver {
  return async (what: string): Promise<string | null> => {
    try {
      return require.resolve(what);
    } catch (e) {
      debug("Node's require.resolve failed, returning null", e);
      return null;
    }
  };
}
