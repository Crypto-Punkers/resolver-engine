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
  workingDir: string = process.cwd(),
  resolver: ResolverEngine<ImportFile> = SolidityImportResolver(),
): Promise<ImportFile[]> {
  let result: ImportFile[] = [];
  let queue: { cwd: string; file: string }[] = [];
  let alreadyImported = new Set();

  const absoluteWhat = path.resolve(workingDir, what);
  queue.push({ cwd: workingDir, file: absoluteWhat });
  alreadyImported.add(solidifyName(absoluteWhat));
  while (queue.length > 0) {
    const fileData = queue.shift()!;
    const resolvedFile: ImportFile = await resolver.require(fileData.file, fileData.cwd);
    const foundImports = findImports(resolvedFile);

    // if imported path starts with '.' we assume it's relative and return it's absolute path
    // if not - return the same name it was imported with
    if (fileData.file[0] === ".") {
      result.push(resolvedFile);
    } else {
      result.push({ path: fileData.file, source: resolvedFile.source });
    }

    const fileParentDir = path.dirname(resolvedFile.path);
    for (let i in foundImports) {
      const solidifiedName: string = solidifyName(foundImports[i]);
      if (!alreadyImported.has(solidifiedName)) {
        alreadyImported.add(solidifiedName);
        queue.push({ cwd: fileParentDir, file: foundImports[i] });
      }
    }
  }

  return result;
}
