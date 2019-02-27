jest.mock("fs");
import { vol } from "memfs";
import { ImportsFsEngine } from "@resolver-engine/imports-fs";
import { gatherSources, ImportFile } from "@resolver-engine/imports";

type dictionary = { [s: string]: string };

function expectedOutput(filesObj: dictionary, provider: string): ImportFile[] {
  let result: ImportFile[] = [];
  for (const k of Object.keys(filesObj)) {
    result.push({
      url: process.cwd() + "/" + k,
      source: filesObj[k],
      provider: provider,
    });
  }
  return result;
}

const data: [string, dictionary, string[], string, string][] = [
  [
    "gathers files included by given file",
    {
      "mainfile.sol": 'blahblah;\nimport "./otherfile.sol";\nimport "./somethingelse.sol";\nrestoffileblahblah',
      "otherfile.sol": "otherfilecontents",
      "somethingelse.sol": "somethingelsecontents",
    },
    ["mainfile.sol"],
    __dirname,
    "fs",
  ],
  [
    "gathers files imported by imported files",
    {
      "mainfile.sol": 'blahblah;\nimport "./otherfile.sol";\nrestoffileblahblah',
      "otherfile.sol": 'hurrdurr;\nimport "./contracts/something.sol";\nblahblah',
      "contracts/something.sol": "filecontents",
    },
    ["mainfile.sol"],
    __dirname,
    "fs",
  ],
  [
    "does not include the same file twice",
    {
      "mainfile.sol": 'blahblah;\nimport "./folder/otherfile.sol";\nimport "./somethingelse.sol";\nrestoffileblahblah',
      "folder/otherfile.sol": 'otherfilecontents;\nimport "../somethingelse.sol";\nsmthsmth',
      "somethingelse.sol": "somethingelsecontents",
    },
    ["mainfile.sol"],
    __dirname,
    "fs",
  ],
  [
    "finds all files imported by multiple starting files",
    {
      "othermain.sol": 'bla;\nimport "./somethingelse.sol";\nimport "./anotherfile.sol";\netcetc',
      "mainfile.sol": 'blahblah;\nimport "./folder/otherfile.sol";\nimport "./somethingelse.sol";\nrestoffileblahblah',
      "folder/otherfile.sol": 'otherfilecontents;\nimport "../somethingelse.sol";\nsmthsmth',
      "somethingelse.sol": "somethingelsecontents",
      "anotherfile.sol": "shiny!",
    },
    ["mainfile.sol", "othermain.sol"],
    __dirname,
    "fs",
  ],
];

describe("gatherSources function", function() {
  const resolver = ImportsFsEngine();

  beforeAll(function() {
    // when using mock fs, we are being thrown into the root of the filesystem
    // we need to call it so __dirname makes sense
    process.chdir(__dirname);
  });

  afterEach(function() {
    vol.reset();
  });

  it.each(data)("%s", async function(message, test_fs, input, cwd, provider) {
    const EXPECTED_FILES = expectedOutput(test_fs, provider);

    vol.fromJSON(test_fs);
    const fileList = await gatherSources(input, cwd, resolver);
    expect(fileList.sort((a, b) => a.url.localeCompare(b.url)))
      .toEqual(EXPECTED_FILES.sort((a, b) => a.url.localeCompare(b.url)));
  });

  it("throws when imported file doesn't exist", async function() {
    const test_fs: dictionary = {
      "main.sol": 'import "./otherfile.sol";\nrestoffileblahblah',
    };

    vol.fromJSON(test_fs);
    await expect(gatherSources(["main.sol"], __dirname, resolver)).rejects.toThrowError();
  });
});
