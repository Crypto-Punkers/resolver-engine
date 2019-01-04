import { ImportFile, SolidityImportResolver } from "./importresolver";
import { ResolverEngine } from "../resolverengine";
import path from "path";

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
  what: string,
  workingDir?: string,
  resolver: ResolverEngine<ImportFile> = SolidityImportResolver(),
): Promise<ImportFile[]> {
  let result: ImportFile[] = [];
  let queue = [];
  let alreadyImported = new Set();

  queue.push({ cwd: workingDir, file: what });
  alreadyImported.add(solidifyName(what));
  while (queue.length > 0) {
    const fileData = queue.shift()!;
    let tmp: ImportFile = await resolver.require(fileData.file, fileData.cwd);
    const foundImports = findImports(tmp);
    result.push(tmp);
    const filewd = path.dirname(tmp.path);
    for (let i in foundImports) {
      const solidifiedName: string = solidifyName(foundImports[i]);
      if (!alreadyImported.has(solidifiedName)) {
        alreadyImported.add(solidifiedName);
        queue.push({ cwd: filewd, file: foundImports[i] });
      }
    }
  }

  return result;
}
