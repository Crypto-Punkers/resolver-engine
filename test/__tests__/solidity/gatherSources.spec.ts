jest.mock("fs");
import { gatherSources, ResolverEngine, SolidityImportResolver, ImportFile } from "../../../src";
import { vol } from "memfs";
import deepequal = require("deep-equal");

function expectedOutput(filesObj: { [s: string]: string }): ImportFile[] {
  let result = [];
  for (let k of Object.keys(filesObj)) {
    result.push({
      path: process.cwd() + "/" + k,
      source: filesObj[k],
    });
  }
  return result;
}

/**
 * Checks if a is contained in b, using deep comparison on objects.
 * @param a
 * @param b
 */
function deepSubset<T>(a: T[], b: T[]): boolean {
  return a.every(obj1 => b.some(obj2 => deepequal(obj1, obj2)));
}

describe("gatherSources function", function() {
  const resolver: ResolverEngine<ImportFile> = SolidityImportResolver();

  beforeAll(function() {
    process.chdir(__dirname);
  });

  afterEach(function() {
    vol.reset();
  });

  it("gathers files included by given file", async function() {
    const FILES: { [s: string]: string } = {
      "mainfile.sol": 'blahblah;\nimport "./otherfile.sol";\nimport "./somethingelse.sol";\nrestoffileblahblah',
      "otherfile.sol": "otherfilecontents",
      "somethingelse.sol": "somethingelsecontents",
    };
    const EXPECTED_FILES = expectedOutput(FILES);

    vol.fromJSON(FILES);
    const fileList = await gatherSources("mainfile.sol", process.cwd(), resolver);
    expect(deepSubset(EXPECTED_FILES, fileList)).toBe(true);
  });

  it("gathers files imported by imported files", async function() {
    const FILES: { [s: string]: string } = {
      "mainfile.sol": 'blahblah;\nimport "./otherfile.sol";\nrestoffileblahblah',
      "otherfile.sol": 'hurrdurr;\nimport "./contracts/something.sol";\nblahblah',
      "contracts/something.sol": "filecontents",
    };
    const EXPECTED_FILES = expectedOutput(FILES);

    vol.fromJSON(FILES);
    const fileList = await gatherSources("mainfile.sol", process.cwd(), resolver);
    expect(deepSubset(EXPECTED_FILES, fileList)).toBe(true);
  });

  it("does not include the same file twice", async function() {
    const FILES: { [s: string]: string } = {
      "mainfile.sol": 'blahblah;\nimport "./otherfile.sol";\nimport "./somethingelse.sol";\nrestoffileblahblah',
      "otherfile.sol": 'otherfilecontents;\nimport "./somethingelse.sol";\nsmthsmth',
      "somethingelse.sol": "somethingelsecontents",
    };
    const EXPECTED_FILES = expectedOutput(FILES);

    vol.fromJSON(FILES);
    const fileList = await gatherSources("mainfile.sol", process.cwd());
    expect(deepSubset(EXPECTED_FILES, fileList)).toBe(true);
  });

  it("works without passing resolver to it", async function() {
    const FILES: { [s: string]: string } = {
      "mainfile.sol": 'blahblah;\nimport "./otherfile.sol";\nrestoffileblahblah',
      "otherfile.sol": "herpderp",
    };
    const EXPECTED_FILES = expectedOutput(FILES);

    vol.fromJSON(FILES);
    const fileList = await gatherSources("mainfile.sol", process.cwd());
    expect(deepSubset(EXPECTED_FILES, fileList)).toBe(true);
  });
});
