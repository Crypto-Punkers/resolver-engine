import { Context } from "..";

export type SubParser<R> = (url: string, ctx: Context) => Promise<R | null>;
