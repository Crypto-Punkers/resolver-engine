import { ParserContext } from "..";

export type SubParser<R> = (path: string, ctx?: ParserContext) => Promise<R | null>;
