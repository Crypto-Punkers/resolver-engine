import { SubResolver } from ".";

// stub
export function SwarmResolver(): SubResolver {
  return async (uri: string): Promise<string | null> => {
    return null;
  };
}
