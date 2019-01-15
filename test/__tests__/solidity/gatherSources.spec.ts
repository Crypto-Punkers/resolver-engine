jest.mock("fs");
import { vol } from "memfs";
import { gatherSources, ImportFile, ResolverEngine, SolidityImportResolver } from "../../../src";
import deepequal = require("deep-equal");

type dictStringString = { [s: string]: string };

function expectedOutput(filesObj: dictStringString): ImportFile[] {
  let result: ImportFile[] = [];
  for (const k of Object.keys(filesObj)) {
    result.push({
      url: process.cwd() + "/" + k,
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

// when using mock fs, we are being thrown into the root of the filesystem
// we need to call it so process.cwd() makes sense
process.chdir(__dirname);

const data = [
  [
    "gathers files included by given file",
    {
      "mainfile.sol": 'blahblah;\nimport "./otherfile.sol";\nimport "./somethingelse.sol";\nrestoffileblahblah',
      "otherfile.sol": "otherfilecontents",
      "somethingelse.sol": "somethingelsecontents",
    },
    ["mainfile.sol"],
    process.cwd(),
  ],
  [
    "gathers files imported by imported files",
    {
      "mainfile.sol": 'blahblah;\nimport "./otherfile.sol";\nrestoffileblahblah',
      "otherfile.sol": 'hurrdurr;\nimport "./contracts/something.sol";\nblahblah',
      "contracts/something.sol": "filecontents",
    },
    ["mainfile.sol"],
    process.cwd(),
  ],
  [
    "does not include the same file twice",
    {
      "mainfile.sol": 'blahblah;\nimport "./otherfile.sol";\nimport "./somethingelse.sol";\nrestoffileblahblah',
      "otherfile.sol": 'otherfilecontents;\nimport "./somethingelse.sol";\nsmthsmth',
      "somethingelse.sol": "somethingelsecontents",
    },
    ["mainfile.sol"],
    process.cwd(),
  ],
];

describe("gatherSources function", function() {
  const resolver: ResolverEngine<ImportFile> = SolidityImportResolver();

  afterEach(function() {
    vol.reset();
  });

  it.each(data)("%s", async function(message, test_fs, input, cwd) {
    const EXPECTED_FILES = expectedOutput(test_fs);

    vol.fromJSON(test_fs);
    const fileList = await gatherSources(input, cwd, resolver);
    expect(deepSubset(EXPECTED_FILES, fileList)).toBe(true);
  });

  it("throws when imported file doesn't exist", async function() {
    const test_fs: dictStringString = {
      "main.sol": 'import "./otherfile.sol";\nrestoffileblahblah',
    };

    vol.fromJSON(test_fs);
    await expect(gatherSources(["main.sol"], process.cwd(), resolver)).rejects.toThrowError();
  });
});
