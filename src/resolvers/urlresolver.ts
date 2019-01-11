import { SubResolver } from ".";

export function UriResolver(): SubResolver {
  return async (uri: string): Promise<string | null> => {
    try {
      return new URL(uri).href;
    } catch {
      return null;
    }
  };
}
