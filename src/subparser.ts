export interface SubParser<R> {
  require(path: string): Promise<R | null>;
}
