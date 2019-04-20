jest.mock("fs");
import { gatherSources, ImportFile } from "@resolver-engine/imports";
import { ImportsFsEngine } from "@resolver-engine/imports-fs";
import { vol } from "memfs";
import nock from "nock";

interface Dictionary {
  [s: string]: string;
}

function expectedOutput(filesObj: Dictionary, provider: string, namePrefix: string): ImportFile[] {
  const result: ImportFile[] = [];
  let prefix = namePrefix;
  if (namePrefix !== "") {
    prefix += "/";
  }
  for (const k of Object.keys(filesObj)) {
    result.push({
      url: prefix + k,
      source: filesObj[k],
      provider,
    });
  }
  return result;
}

const data: Array<[string, Dictionary, string[], string, string]> = [
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

  it.each(data)("%s", async function(message, testFs, input, cwd, provider) {
    const EXPECTED_FILES = expectedOutput(testFs, provider, cwd);

    vol.fromJSON(testFs);
    const fileList = await gatherSources(input, cwd, resolver);
    expect(fileList.sort((a, b) => a.url.localeCompare(b.url))).toEqual(
      EXPECTED_FILES.sort((a, b) => a.url.localeCompare(b.url)),
    );
  });

  it("throws when imported file doesn't exist", async function() {
    const testFs: Dictionary = {
      "main.sol": 'import "./otherfile.sol";\nrestoffileblahblah',
    };

    vol.fromJSON(testFs);
    await expect(gatherSources(["main.sol"], __dirname, resolver)).rejects.toThrowError();
  });

  describe("URLs", function() {
    const FILE_GITHUB_NO_IMPORTS = "github something";
    const FILE_GITHUB_IMPORT_URL = 'a\nimport "http://somepage.tv/some/path/file.sol";\nrestoffile';
    const FILE_GITHUB_LOCAL_IMPORT = 'file\nimport "./file_no_imports.sol";plplplpl';
    const FILE_URL_NO_IMPORTS = "something something";
    const FILE_URL_IMPORT_GITHUB =
      'qwer\nimport "https://github.com/user/repo/blob/master/path/to/file/file_no_imports.sol";\nrest';
    const FILE_URL_LOCAL_IMPORT = 'reeeee!\nimport "./file.sol";fuuuu';

    beforeAll(function() {
      nock.disableNetConnect();
    });

    beforeEach(function() {
      const githubScope = nock("https://github.com");
      githubScope.get("/user/repo/blob/master/path/to/file/file_no_imports.sol").reply(200, FILE_GITHUB_NO_IMPORTS);
      githubScope.get("/user/repo/blob/master/path/to/file/file_with_url.sol").reply(200, FILE_GITHUB_IMPORT_URL);
      githubScope.get("/user/repo/blob/master/path/to/file/file_with_local.sol").reply(200, FILE_GITHUB_LOCAL_IMPORT);
      const rawGithubScope = nock("https://raw.githubusercontent.com:443");
      rawGithubScope.get("/user/repo/master/path/to/file/file_no_imports.sol").reply(200, FILE_GITHUB_NO_IMPORTS);
      rawGithubScope.get("/user/repo/master/path/to/file/file_with_url.sol").reply(200, FILE_GITHUB_IMPORT_URL);
      rawGithubScope.get("/user/repo/master/path/to/file/file_with_local.sol").reply(200, FILE_GITHUB_LOCAL_IMPORT);
      const someScope = nock("http://somepage.tv");
      someScope.get("/some/path/file.sol").reply(200, FILE_URL_NO_IMPORTS);
      someScope.get("/other/path/file_with_g.sol").reply(200, FILE_URL_IMPORT_GITHUB);
      someScope.get("/some/path/file_local.sol").reply(200, FILE_URL_LOCAL_IMPORT);
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

    it("downloads file from GitHub with local import", async function() {
      const fileList = await gatherSources(
        ["https://github.com/user/repo/blob/master/path/to/file/file_with_local.sol"],
        "",
        resolver,
      );
      const EXPECTED_RESULT = [
        {
          url: "https://github.com/user/repo/blob/master/path/to/file/file_with_local.sol",
          source: FILE_GITHUB_LOCAL_IMPORT,
          provider: "github",
        },
        {
          url: "https://github.com/user/repo/blob/master/path/to/file/file_no_imports.sol",
          source: FILE_GITHUB_NO_IMPORTS,
          provider: "github",
        },
      ];
      expect(fileList.sort((a, b) => a.url.localeCompare(b.url))).toEqual(
        EXPECTED_RESULT.sort((a, b) => a.url.localeCompare(b.url)),
      );
    });

    it("downloads file from URL containing import via GitHub", async function() {
      const fileList = await gatherSources(["http://somepage.tv/other/path/file_with_g.sol"], "", resolver);
      const EXPECTED_RESULT = [
        {
          url: "http://somepage.tv/other/path/file_with_g.sol",
          source: FILE_URL_IMPORT_GITHUB,
          provider: "http",
        },
        {
          url: "https://github.com/user/repo/blob/master/path/to/file/file_no_imports.sol",
          source: FILE_GITHUB_NO_IMPORTS,
          provider: "github",
        },
      ];
      expect(fileList.sort((a, b) => a.url.localeCompare(b.url))).toEqual(
        EXPECTED_RESULT.sort((a, b) => a.url.localeCompare(b.url)),
      );
    });

    it("downloads filr from URL with local import", async function() {
      const fileList = await gatherSources(["http://somepage.tv/some/path/file_local.sol"], "", resolver);
      const EXPECTED_RESULT = [
        {
          url: "http://somepage.tv/some/path/file_local.sol",
          source: FILE_URL_LOCAL_IMPORT,
          provider: "http",
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
