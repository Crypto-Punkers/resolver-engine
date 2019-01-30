import { parsers as core_p, resolvers as core_r } from "@resolver-engine/core";
import { FsParser } from "./parsers/fsparser";
import { BacktrackFsResolver } from "./resolvers/backtrackfsresolver";
import { FsResolver } from "./resolvers/fsresolver";
import { NodeResolver } from "./resolvers/noderesolver";

export const resolvers = {
  BacktrackFsResolver,
  FsResolver,
  NodeResolver,
  UriResolver: core_r.UriResolver,
};

export const parsers = {
  FsParser,
  UrlParser: core_p.UrlParser,
};
