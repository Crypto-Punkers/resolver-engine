export type SubParser<R> = (path: string) => Promise<R | null>;
