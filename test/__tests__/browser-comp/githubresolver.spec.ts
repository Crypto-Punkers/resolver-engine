import { vol } from "memfs";
import nock from "nock";
import { BrowserCompatibleGithubResolver, FsParser, MemFSWrapped, SubParser, SubResolver } from "../../../src";
import { defaultContext } from "../../utils";

describe("GithubResolver", function() {
  let instance: SubResolver;
  let contentsResolver: SubParser<string>;

  beforeAll(function() {
    nock.disableNetConnect();
    contentsResolver = FsParser(new MemFSWrapped());
    process.chdir(__dirname); // any directory will do in fact
    vol.fromJSON({ "stub.file": "lol" }, "/tmp");
  });

  beforeEach(function() {
    instance = BrowserCompatibleGithubResolver();
  });

  it("returns null on fs paths", async function() {
    vol.fromJSON({
      "./relative/path.file": "wrong",
      "/root/path.file": "wrong",
    });

    expect(await instance("relative/path.file", defaultContext("test"))).toBeNull();
    expect(await instance("/root/path.file", defaultContext("test"))).toBeNull();
  });

  it("returns null on non-github links", async function() {
    expect(await instance("http://captive.apple.com", defaultContext("test"))).toBeNull();
  });

  describe("url testing", function() {
    const checkUrl = function(url: string, expectedPath: string) {
      return async () => {
        const CONTENTS = "Success\n";
        nock("https://raw.githubusercontent.com:443")
          .get(expectedPath)
          .reply(200, CONTENTS);

        const path = await instance(url, defaultContext("test"));
        expect(path).not.toBeNull();
        expect(await contentsResolver(path!)).toEqual(CONTENTS);
      };
    };

    it("returns file in root directory", checkUrl("github:nock/nock/README.md", "/nock/nock/master/README.md"));
    it("returns nested file", checkUrl("github:nock/nock/lib/mixin.js", "/nock/nock/master/lib%2Fmixin.js"));
    it(
      "returns from a specific branch",
      checkUrl("github:nock/nock/README.md#test-branch", "/nock/nock/test-branch/README.md"),
    );

    it(
      "works with specific commit",
      checkUrl(
        "github:nock/nock/README.md#4194106f6de0669afa4b8f317fa21892bc164b3e",
        "/nock/nock/4194106f6de0669afa4b8f317fa21892bc164b3e/README.md",
      ),
    );

    it(
      "works with http:// links",
      checkUrl("http://github.com/nock/nock/lib/mixin.js", "/nock/nock/master/lib%2Fmixin.js"),
    );
    it(
      "works with https:// links",
      checkUrl("https://github.com/nock/nock/lib/mixin.js", "/nock/nock/master/lib%2Fmixin.js"),
    );
  });
});
