import Debug from "debug";
import { ResolverContext, SubResolver } from "../resolvers";
import { BacktrackFsResolver } from "../resolvers/backtrackfsresolver";
const debug = Debug("resolverengine:ethpmresolver");

// 1st group - package name
// 2nd group - contract path
const FILE_LOCATION_REGEX = /^([^/]+)\/(.+)$/;

const prefixT = "installed_contracts";
const prefix0x = "contracts";

export function EthPmResolver(): SubResolver {
  const backtrackT = BacktrackFsResolver(prefixT);
  const backtrack0x = BacktrackFsResolver(prefix0x);

  return async (what: string, ctx?: ResolverContext): Promise<string | null> => {
    const fileMatch = what.match(FILE_LOCATION_REGEX);
    if (!fileMatch) {
      return null;
    }

    // const [, packageName, internalPath] = fileMatch;

    // let result = backtrackT(path.join(packageName, prefixT + "/", internalPath), ctx);
    let result = await backtrackT(what, ctx);
    if (result) {
      debug("Resolved %s to %s", what, result);
      return result;
    }

    // result = backtrack0x(path.join(packageName, prefix0x + "/", internalPath), ctx);
    result = await backtrack0x(what, ctx);
    if (result) {
      debug("Resolved %s to %s", what, result);
      return result;
    }

    return null;
  };
}
