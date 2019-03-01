jest.mock("fs");
import nock from "nock";
import { vol } from "memfs";
import { ImportsFsEngine } from "@resolver-engine/imports-fs";
import { gatherSources, ImportFile } from "@resolver-engine/imports";

type dictionary = { [s: string]: string };

function expectedOutput(filesObj: dictionary, provider: string, namePrefix: string): ImportFile[] {
  let result: ImportFile[] = [];
  let prefix = namePrefix;
  if (namePrefix !== "") {
    prefix += "/";
  }
  for (const k of Object.keys(filesObj)) {
    result.push({
      url: prefix + k,
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
  [
    "gathers files included by given file without absolute path",
    {
      "mainfile.sol": 'blahblah;\nimport "./otherfile.sol";\nimport "./somethingelse.sol";\nrestoffileblahblah',
      "otherfile.sol": "otherfilecontents",
      "somethingelse.sol": "somethingelsecontents",
    },
    ["mainfile.sol"],
    "",
    "fs",
  ],
  [
    "gathers files imported by imported files without absolute path",
    {
      "mainfile.sol": 'blahblah;\nimport "./otherfile.sol";\nrestoffileblahblah',
      "otherfile.sol": 'hurrdurr;\nimport "./contracts/something.sol";\nblahblah',
      "contracts/something.sol": "filecontents",
    },
    ["mainfile.sol"],
    "",
    "fs",
  ],
  [
    "does not include the same file twice without absolute path",
    {
      "mainfile.sol": 'blahblah;\nimport "./folder/otherfile.sol";\nimport "./somethingelse.sol";\nrestoffileblahblah',
      "folder/otherfile.sol": 'otherfilecontents;\nimport "../somethingelse.sol";\nsmthsmth',
      "somethingelse.sol": "somethingelsecontents",
    },
    ["mainfile.sol"],
    "",
    "fs",
  ],
  [
    "finds all files imported by multiple starting files without absolute path",
    {
      "othermain.sol": 'bla;\nimport "./somethingelse.sol";\nimport "./anotherfile.sol";\netcetc',
      "mainfile.sol": 'blahblah;\nimport "./folder/otherfile.sol";\nimport "./somethingelse.sol";\nrestoffileblahblah',
      "folder/otherfile.sol": 'otherfilecontents;\nimport "../somethingelse.sol";\nsmthsmth',
      "somethingelse.sol": "somethingelsecontents",
      "anotherfile.sol": "shiny!",
    },
    ["mainfile.sol", "othermain.sol"],
    "",
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
    const EXPECTED_FILES = expectedOutput(test_fs, provider, cwd);

    vol.fromJSON(test_fs);
    const fileList = await gatherSources(input, cwd, resolver);
    expect(fileList.sort((a, b) => a.url.localeCompare(b.url))).toEqual(
      EXPECTED_FILES.sort((a, b) => a.url.localeCompare(b.url)),
    );
  });

  it("throws when imported file doesn't exist", async function() {
    const test_fs: dictionary = {
      "main.sol": 'import "./otherfile.sol";\nrestoffileblahblah',
    };

    vol.fromJSON(test_fs);
    await expect(gatherSources(["main.sol"], __dirname, resolver)).rejects.toThrowError();
  });

  describe("URLs", function() {
    const FILE_GITHUB_NO_IMPORTS = "github something";
    const FILE_GITHUB_IMPORT_URL = 'a\nimport "http://somepage.tv/some/path/file.sol";\nrestoffile';
    const FILE_URL_NO_IMPORTS = "something something";

    beforeAll(function() {
      nock.disableNetConnect();
    });

    beforeEach(function() {
      const githubScope = nock("https://github.com");
      githubScope.get("/user/repo/blob/master/path/to/file/file_no_imports.sol").reply(200, FILE_GITHUB_NO_IMPORTS);
      githubScope.get("/user/repo/blob/master/path/to/file/file_with_url.sol").reply(200, FILE_GITHUB_IMPORT_URL);
      const rawGithubScope = nock("https://raw.githubusercontent.com:443");
      rawGithubScope.get("/user/repo/master/path/to/file/file_no_imports.sol").reply(200, FILE_GITHUB_NO_IMPORTS);
      rawGithubScope.get("/user/repo/master/path/to/file/file_with_url.sol").reply(200, FILE_GITHUB_IMPORT_URL);
      const someScope = nock("http://somepage.tv");
      someScope.get("/some/path/file.sol").reply(200, FILE_URL_NO_IMPORTS);
    });

    afterEach(function() {
      nock.cleanAll();
    });

    it("downloads single importless file from URL (without absolute path given)", async function() {
      const fileList = await gatherSources(["http://somepage.tv/some/path/file.sol"], "", resolver);
      const EXPECTED_RESULT = [
        {
          url: "http://somepage.tv/some/path/file.sol",
          source: FILE_URL_NO_IMPORTS,
          provider: "http",
        },
      ];
      expect(fileList).toEqual(EXPECTED_RESULT);
    });

    it("downloads single importless file from GitHub (without absolute path given)", async function() {
      const fileList = await gatherSources(
        ["https://github.com/user/repo/blob/master/path/to/file/file_no_imports.sol"],
        "",
        resolver,
      );
      const EXPECTED_RESULT = [
        {
          url: "https://github.com/user/repo/blob/master/path/to/file/file_no_imports.sol",
          source: FILE_GITHUB_NO_IMPORTS,
          provider: "github",
        },
      ];
      expect(fileList).toEqual(EXPECTED_RESULT);
    });

    it("downloads file from GitHub containig import via URL", async function() {
      const fileList = await gatherSources(
        ["https://github.com/user/repo/blob/master/path/to/file/file_with_url.sol"],
        "",
        resolver,
      );
      const EXPECTED_RESULT = [
        {
          url: "https://github.com/user/repo/blob/master/path/to/file/file_with_url.sol",
          source: FILE_GITHUB_IMPORT_URL,
          provider: "github",
        },
        {
          url: "http://somepage.tv/some/path/file.sol",
          source: FILE_URL_NO_IMPORTS,
          provider: "http",
        },
      ];
      expect(fileList.sort((a, b) => a.url.localeCompare(b.url))).toEqual(
        EXPECTED_RESULT.sort((a, b) => a.url.localeCompare(b.url)),
      );
    });
  });
});
