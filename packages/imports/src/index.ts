export { ImportsEngine } from "./importsengine";
export { ImportFile } from "./parsers/importparser";
import { ImportParser } from "./parsers/importparser";
import { GithubResolver } from "./resolvers/githubresolver";
import { IPFSResolver } from "./resolvers/ipfsresolver";
import { SwarmResolver } from "./resolvers/swarmresolver";
export const resolvers = {
  GithubResolver,
  IPFSResolver,
  SwarmResolver,
};

export const parsers = {
  ImportParser,
};
