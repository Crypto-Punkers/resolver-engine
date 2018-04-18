export interface SubResolver {
  resolve(what: string): Promise<string | null>;
}
