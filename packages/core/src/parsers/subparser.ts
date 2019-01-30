import { Context } from "../resolverengine";
export type SubParser<R> = (url: string, ctx: Context) => Promise<R | null>;
