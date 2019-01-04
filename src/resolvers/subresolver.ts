import { ResolverContext } from "..";

export type Path = string;

export type SubResolver = (what: string, context: ResolverContext) => Promise<Path | null>;
