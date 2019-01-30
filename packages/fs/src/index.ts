import { parsers as core_p, resolvers as core_r } from "@resolver-engine/core";
import { FsParser } from "./parsers/fsparser";
import { BacktrackFsResolver } from "./resolvers/backtrackfsresolver";
import { FsResolver } from "./resolvers/fsresolver";
import { NodeResolver } from "./resolvers/noderesolver";

export const resolvers = {
  BacktrackFsResolver,
  FsResolver,
  NodeResolver,
  ...core_r,
};

export const parsers = {
  FsParser,
  ...core_p,
};
