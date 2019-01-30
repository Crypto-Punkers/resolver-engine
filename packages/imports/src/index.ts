export { ImportsEngine } from "./importsengine";
export { ImportFile } from "./parsers/importparser";
export * from "./utils";
import { parsers as core_p, resolvers as core_r } from "@resolver-engine/core";
import { ImportParser } from "./parsers/importparser";
import { GithubResolver } from "./resolvers/githubresolver";
import { IPFSResolver } from "./resolvers/ipfsresolver";
import { SwarmResolver } from "./resolvers/swarmresolver";
export const resolvers = {
  GithubResolver,
  IPFSResolver,
  SwarmResolver,
  ...core_r,
};

export const parsers = {
  ImportParser,
  ...core_p,
};
