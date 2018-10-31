import * as process from "process";
import { ResolverContext } from "../../src";

export function defaultCtx(): ResolverContext {
  return {
    cwd: process.cwd(),
  };
}
