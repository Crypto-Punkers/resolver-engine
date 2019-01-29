import { ResolverContext } from "@resolver-engine/core";
import * as process from "process";

export function defaultContext(): ResolverContext {
  return {
    cwd: process.cwd(),
  };
}
