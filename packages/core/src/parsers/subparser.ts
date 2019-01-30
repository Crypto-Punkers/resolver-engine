export interface ParserContext {
  resolver: string;
}

export type SubParser<R> = (url: string, ctx: ParserContext) => Promise<R | null>;
