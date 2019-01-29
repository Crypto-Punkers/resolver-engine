export interface ResolverContext {
  cwd?: string;
}

export interface ResolverMetadata {
  url: string;
  resourceName?: string;
}

// Resolver takes a short-cut name of the file (URI), and returns a cannonical location (URL) of where the resource exists
// and the resource's name (i.e. filename or full path depending on the source itself) if available
// https://stackoverflow.com/questions/176264/what-is-the-difference-between-a-uri-a-url-and-a-urn/1984225#1984225
export type SubResolver = (what: string, context: ResolverContext) => Promise<ResolverMetadata | null>;
