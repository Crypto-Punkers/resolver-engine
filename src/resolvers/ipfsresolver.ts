import { ResolverContext, ResolverMetadata, SubResolver } from ".";

// 1. (root / path to resource)
const IPFS_URI = /^ipfs:\/\/(.+)$/;

export function IPFSResolver(): SubResolver {
  return async function ipfs(uri: string, ctx: ResolverContext): Promise<ResolverMetadata | null> {
    const ipfsMatch = uri.match(IPFS_URI);
    if (ipfsMatch) {
      const [, resourcePath] = ipfsMatch;
      const url = "https://gateway.ipfs.io/ipfs/" + resourcePath;
      return { url: url };
    }

    return null;
  };
}
