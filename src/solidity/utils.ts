import path from "path";
import { ResolverEngine } from "../resolverengine";
import { ImportFile } from "./importparser";
import { SolidityImportResolver } from "./importresolver";

export function findImports(data: ImportFile): string[] {
  let result: string[] = [];
  // regex below matches all possible import statements, namely:
  // - import "somefile";
  // - import "somefile" as something;
  // - import something from "somefile"
  // (double that for single quotes)
  // and captures file names
  const regex: RegExp = /import\s+(?:(?:"([^;]*)"|'([^;]*)')(?:;|\s+as\s+[^;]*;)|.+from\s+(?:"(.*)"|'(.*)');)/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(data.source))) {
    for (let i = 1; i < match.length; i++) {
      if (match[i] !== undefined) {
        result.push(match[i]);
        break;
      }
    }
  }
  return result;
}

interface ImportTreeNode extends ImportFile {
  uri: string;
  imports: { uri: string; url: string }[];
}

async function traverseSources(
  whats: string[],
  workingDir: string,
  resolver: ResolverEngine<ImportFile>,
): Promise<ImportTreeNode[]> {
  let result: ImportTreeNode[] = [];
  let alreadyImported = new Set();

  async function dfs(file: { searchCwd: string; uri: string }): Promise<string> {
    const url = await resolver.resolve(file.uri, file.searchCwd);
    if (alreadyImported.has(url)) {
      return url;
    }

    const resolvedFile = await resolver.require(file.uri, file.searchCwd);

    alreadyImported.add(url);

    const foundImportURIs = findImports(resolvedFile);

    const fileNode: ImportTreeNode = { uri: file.uri, imports: [], ...resolvedFile };

    const resolvedCwd = path.dirname(url);
    for (const importUri of foundImportURIs) {
      const importUrl = await dfs({ searchCwd: resolvedCwd, uri: importUri });
      fileNode.imports.push({ uri: importUri, url: importUrl });
    }

    result.push(fileNode);
    return resolvedFile.url;
  }

  await Promise.all(whats.map(what => dfs({ searchCwd: workingDir, uri: what })));

  return result;
}

export async function gatherSources(
  whats: string[],
  workingDir: string,
  resolver: ResolverEngine<ImportFile> = SolidityImportResolver(),
): Promise<ImportFile[]> {
  return (await traverseSources(whats, workingDir, resolver)).map(node => {
    return { url: node.url, source: node.source };
  });
}

export async function gatherSourcesAndCanonizeImports(
  whats: string[],
  workingDir: string,
  resolver: ResolverEngine<ImportFile> = SolidityImportResolver(),
) {
  function canonizeFile(file: ImportTreeNode) {
    file.imports.forEach(i => (file.source = file.source.replace(i.uri, i.url)));
  }
  return (await traverseSources(whats, workingDir, resolver)).map(canonizeFile);
}
