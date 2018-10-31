export interface ResolverContext {
  cwd: string;
}

export type SubResolver = (what: string, ctx: ResolverContext) => Promise<string | null>;
