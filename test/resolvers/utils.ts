import * as process from "process";
import { ResolverContext } from "../../src";

export function defaultContext(): ResolverContext {
  return {
    cwd: process.cwd(),
  };
}
