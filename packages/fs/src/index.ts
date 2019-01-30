import { FsParser } from "./parsers/fsparser";
import { BacktrackFsResolver } from "./resolvers/backtrackfsresolver";
import { FsResolver } from "./resolvers/fsresolver";
import { NodeResolver } from "./resolvers/noderesolver";

export const resolvers = {
  BacktrackFsResolver,
  FsResolver,
  NodeResolver,
};

export const parsers = {
  FsParser,
};
