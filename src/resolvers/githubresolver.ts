import { UrlResolver } from ".";
import * as GitInfo from "hosted-git-info";
import Debug from "debug";

const debug = Debug("resolverengine:githubresolver");

// hosted-git-info is a godsend, but it doesn't support specific files
// use a hack to capture third slash a file skipping commitish
// 1st group - protocol, location, owner, repo
// 2nd group - file inside repo
// 3rd group - comittish
const FILE_LOCATION_REGEX = /^((?:.+:\/\/)?[^:/]+[/:][^/]+[/][^/]+)[/](.+?)(#.+)?$/;

// TODO(ritave): Support private repositories
export class GithubResolver extends UrlResolver {
  async resolve(what: string): Promise<string | null> {
    const fileMatch = what.match(FILE_LOCATION_REGEX);
    if (!fileMatch) {
      return null;
    }
    const [, url, file, comittish] = fileMatch;
    const gitInfo = GitInfo.fromUrl(url + (comittish || ""));
    if (!gitInfo) {
      return null;
    }
    const fileUrl = gitInfo.file(file);
    debug("Parsed url to:", fileUrl);

    return super.resolve(fileUrl);
  }
}
