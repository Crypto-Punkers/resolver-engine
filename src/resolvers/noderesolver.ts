import Debug from "debug";

import { SubResolver } from "./subresolver";

const debug = Debug("resolverengine:noderesolver");

export class NodeResolver implements SubResolver {
  async resolve(what: string): Promise<string | null> {
    try {
      return require.resolve(what);
    } catch (e) {
      debug("Node's require.resolve failed, returning null", e);
      return null;
    }
  }
}
