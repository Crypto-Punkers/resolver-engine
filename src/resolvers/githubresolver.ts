import Debug from "debug";
import { SubResolver } from ".";

const debug = Debug("resolverengine:githubresolver");

const BROWSER_LINK_REGEX = /^https?:\/\/github\.com\/([^/]+)\/([^/]+)\/blob\/((?:[^/]+[/])*[^/]+)$/;
const GITHUB_URI_REGEX = /^github:([^/]+)\/([^/]+)\/((?:[^/#]+[/])*[^/#]+?)(#\w+)?$/;
const WEIRD_BROWSER_LINK_REGEX = /^https?:\/\/github\.com\/([^/]+)\/([^/]+)\/((?:[^/]+[/])*[^/]+)$/; // remix

// TODO(ritave): Support private repositories
export function GithubResolver(): SubResolver {
  return async (what: string): Promise<string | null> => {
    debug("Resolving %s", what);
    // GitInfo returned invalid results (ask me about this: %2F)

    const fileMatchLink = what.match(BROWSER_LINK_REGEX);
    if (fileMatchLink) {
      const [, owner, repo, commitAndFile] = fileMatchLink;
      const gitRawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${commitAndFile}`;
      debug("Resolved uri to:", gitRawUrl);
      return gitRawUrl;
    }

    const fileMatchWeird = what.match(WEIRD_BROWSER_LINK_REGEX);
    if (fileMatchWeird) {
      const [, owner, repo, file] = fileMatchWeird;
      const gitRawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/master/${file}`;
      debug("Resolved uri to:", gitRawUrl);
      return gitRawUrl;
    }

    const fileMatchUri = what.match(GITHUB_URI_REGEX);
    if (fileMatchUri) {
      const [, owner, repo, file, hashCommit] = fileMatchUri;
      let commit = "";
      if (!hashCommit) {
        commit = "master";
      } else {
        commit = hashCommit.substr(1);
      }
      const gitRawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${commit}/${file}`;
      debug("Resolved uri to:", gitRawUrl);
      return gitRawUrl;
    }

    return null;
  };
}
