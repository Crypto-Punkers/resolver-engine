export { ImportsFsEngine } from "./importsfsengine";
import { parsers as core_p, resolvers as core_r } from "@resolver-engine/core";
import { parsers as fs_p, resolvers as fs_r } from "@resolver-engine/fs";
import { parsers as imp_p, resolvers as imp_r } from "@resolver-engine/imports";
import { EthPmResolver } from "./resolvers/ethpmresolver";

// note to future self:
// object destructuring doesn't work in this case
// i.e.: ...fs_r, ...imp_r
// generated import paths in *.d.ts point to invalid files
// this is a more laborious way of achieving the same goal

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
  FsParser: fs_p.FsParser,
  ImportParser: imp_p.ImportParser,
};
