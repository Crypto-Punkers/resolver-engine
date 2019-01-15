import { SubResolver } from ".";

// stub
export function IPFSResolver(): SubResolver {
  return async (uri: string): Promise<string | null> => {
    return null;
  };
}
