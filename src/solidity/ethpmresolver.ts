import * as path from "path";
import { SubResolver } from "../resolvers";
import { BacktrackFsResolver } from "../resolvers/backtracktfsresolver";
import { ResolverContext } from "..";

// 1st group - package name
// 2nd group - contract path
const FILE_LOCATION_REGEX = /^(.+?)\/(.+)$/;

export function EthPmResolver(epmDirectory: string = "installed_contracts/"): SubResolver {
  const fsResolver = BacktrackFsResolver(epmDirectory);

  return async (what: string, ctx: ResolverContext): Promise<string | null> => {
    const fileMatch = what.match(FILE_LOCATION_REGEX);
    if (!fileMatch) {
      return null;
    }

    // In case it actually spells out the "contracts/" folder
    let result = await fsResolver(what, ctx);
    if (result) {
      return result;
    }

    const [, packageName, internalPath] = fileMatch;

    return fsResolver(path.join(packageName, "contracts/", internalPath), ctx);
  };
}
