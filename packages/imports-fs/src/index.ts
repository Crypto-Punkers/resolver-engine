export { ImportsFsEngine } from "./importsfsengine";
import { parsers as core_p, resolvers as core_r } from "@resolver-engine/core";
import { parsers as fs_p, resolvers as fs_r } from "@resolver-engine/fs";
import { parsers as imp_p, resolvers as imp_r } from "@resolver-engine/imports";
import { EthPmResolver } from "./resolvers/ethpmresolver";

export const resolvers = {
  EthPmResolver,
  UriResolver: core_r.UriResolver,
  BacktrackFsResolver: fs_r.BacktrackFsResolver,
  FsResolver: fs_r.FsResolver,
  NodeResolver: fs_r.NodeResolver,
  GithubResolver: imp_r.GithubResolver,
  IPFSResolver: imp_r.IPFSResolver,
  SwarmResolver: imp_r.SwarmResolver,
};

export const parsers = {
  UrlParser: core_p.UrlParser,
  ...fs_p,
  ...imp_p,
};
