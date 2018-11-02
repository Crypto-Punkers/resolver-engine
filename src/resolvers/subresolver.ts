export interface ResolverContext {
  cwd: string;
}

export type SubResolver = (what: string, context: ResolverContext) => Promise<string | null>;
