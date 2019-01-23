import { ResolverContext, ResolverResult, SubResolver } from ".";

// 1. (hash)
const SWARM_URI = /^bzz-raw:\/\/(\w+)/;
const SWARM_GATEWAY = "https://swarm-gateways.net/bzz-raw:/";

export function SwarmResolver(): SubResolver {
  return async function swarm(uri: string, ctx: ResolverContext): Promise<ResolverResult | null> {
    const swarmMatch = uri.match(SWARM_URI);
    if (swarmMatch) {
      const [, hash] = swarmMatch;
      return { url: SWARM_GATEWAY + hash };
    }

    return null;
  };
}
