export type SubParser<R> = (ctx: Context, path: string) => Promise<R | null>;
