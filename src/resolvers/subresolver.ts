export interface ResolverContext {
  cwd: string;
  environment: "node" | "browser";
  system: IResolverServiceLayer;
}

export type Path = string;

export type SubResolver = (what: string, context: ResolverContext) => Promise<Path | null>;

export interface IResolverServiceLayer {
  requestGet(url: string, error: (err: Error) => void, response: (data: any) => void, end: () => void): void;
  tmpFile(cb: (error: any, path: string, sink: (data: any) => void) => void): void;
}