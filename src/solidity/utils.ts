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

// when importing files from parent directory solc requests sifferent file name
// e.g. for "../dir/file" solc requests file named "dir/file"
// solidifyName returns file name that will  be requested by solc
export function solidifyName(fileName: string): string {
  return fileName.split("./").pop()!;
}

export async function gatherSources(
  whats: string[],
  workingDir: string,
  resolver: ResolverEngine<ImportFile> = SolidityImportResolver(),
): Promise<ImportFile[]> {
  let result: ImportFile[] = [];
  let queue: { cwd: string; file: string; retativeTo: string }[] = [];
  let alreadyImported = new Set();

  // solc resolves relative paths starting from current file's path, so if we leave relative path then
  // imported path "../../a/b/c.sol" from file "file.sol" resolves to a/b/c.sol, which is wrong.
  // we start from file;s absolute path so relative path can resolve correctly
  const absoluteWhats = whats.map(what => path.resolve(workingDir, what));
  for (const absWhat of absoluteWhats) {
    queue.push({ cwd: workingDir, file: absWhat, retativeTo: workingDir });
    alreadyImported.add(solidifyName(absWhat));
  }
  while (queue.length > 0) {
    const fileData = queue.shift()!;
    const resolvedFile: ImportFile = await resolver.require(fileData.file, fileData.cwd);
    const foundImports = findImports(resolvedFile);

    // if imported path starts with '.' we assume it's relative and return it's absolute path
    // if not - return the same name it was imported with
    let relativePath: string;
    if (fileData.file[0] === ".") {
      relativePath = path.join(fileData.retativeTo, fileData.file);
      result.push({ url: relativePath, source: resolvedFile.source });
    } else {
      relativePath = fileData.file;
      result.push({ url: relativePath, source: resolvedFile.source });
    }

    const fileParentDir = path.dirname(resolvedFile.url);
    for (const i in foundImports) {
      const solidifiedName: string = solidifyName(foundImports[i]);
      if (!alreadyImported.has(solidifiedName)) {
        alreadyImported.add(solidifiedName);
        queue.push({ cwd: fileParentDir, file: foundImports[i], retativeTo: path.dirname(relativePath) });
      }
    }
  }

  return result;
}
