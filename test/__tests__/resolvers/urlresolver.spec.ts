import { vol } from "memfs";
import nock from "nock";
import { FsParser, SubParser, SubResolver, UrlResolver } from "../../../src";
import { defaultContext } from "../../utils";

describe("UrlResolver", function() {
  let instance: SubResolver;
  let contentsResolver: SubParser<string>;

  beforeAll(function() {
    nock.disableNetConnect();
    contentsResolver = FsParser();
  });

  beforeEach(function() {
    instance = UrlResolver();
    vol.fromJSON({ "stub.file": "lol" }, "/tmp");
  });

  afterEach(function() {
    vol.reset();
    expect(nock.isDone()).toBe(true);
  });

  it("returns null on non-urls", async function() {
    vol.fromJSON({
      "./relative/path.file": "wrong",
    });

    expect(await instance("relative/path.file", defaultContext("test"))).toBeNull();
  });

  it("downloads the file", async function() {
    const CONTENTS = "<HTML><HEAD><TITLE>Success</TITLE></HEAD><BODY>Success</BODY></HTML>\n";
    nock("http://captive.apple.com:80")
      .get("/")
      .reply(200, CONTENTS);

    const path = await instance("http://captive.apple.com/", defaultContext("test"));
    expect(path).not.toBeNull();
    expect(await contentsResolver(path!)).toBe(CONTENTS);
  });

  it("throws on network error", async function() {
    const ERROR = "test error";
    nock("http://somewebsite.com:80")
      .get("/")
      .replyWithError(ERROR);

    await expect(instance("http://somewebsite.com", defaultContext("test"))).rejects.toThrowError(ERROR);
  });

  it("throws on failure code", async function() {
    nock("http://somewebsite.com:80")
      .get("/")
      .reply(404);

    await expect(instance("http://somewebsite.com", defaultContext("test"))).rejects.toThrow();
  });
});
