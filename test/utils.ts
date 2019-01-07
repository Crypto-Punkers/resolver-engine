import * as process from "process";
import { ResolverContext } from "../src";

export function defaultContext(): ResolverContext {
  return {
    cwd: process.cwd(),
  } as ResolverContext; // tests created before my changes don't need anything more
}
