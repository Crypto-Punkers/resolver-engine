jest.mock('fs');
import nock from "nock";
import { FsParser, SubParser, SubResolver, UrlResolver } from "../../src";
import { defaultContext } from "../utils";
import { vol } from 'memfs';

describe.skip("UrlResolver", function () {
  let instance: SubResolver;
  let contentsResolver: SubParser<string>;

  beforeAll(function () {
    nock.disableNetConnect();
    contentsResolver = FsParser();
  });

  beforeEach(function () {
    instance = UrlResolver();
    vol.fromJSON({ "stub.file": "lol" }, "/tmp");
  });

  afterEach(function () {
    vol.reset();
    expect(nock.isDone()).toBe(true);
  });

  it("returns null on non-urls", async function () {
    vol.fromJSON({
      "./relative/path.file": "wrong",
    });

    expect(await instance("relative/path.file", defaultContext())).toBeNull();
  });

  it("downloads the file", async function () {
    const CONTENTS = "<HTML><HEAD><TITLE>Success</TITLE></HEAD><BODY>Success</BODY></HTML>\n";
    nock("http://captive.apple.com:80")
      .get("/")
      .reply(200, CONTENTS);

    const path = await instance("http://captive.apple.com/", defaultContext());
    expect(path).not.toBeNull();
    expect(await contentsResolver(path!)).toBe(CONTENTS);
  });

  it("throws on network error", async function () {
    const ERROR = "test error";
    nock("http://somewebsite.com:80")
      .get("/")
      .replyWithError(ERROR);

    // expect(await instance("http://somewebsite.com", defaultContext())).toThrowError(ERROR);
    await expect(instance("http://somewebsite.com", defaultContext())).rejects.toThrowError(ERROR);
  });

  it("throws on failure code", async function () {
    nock("http://somewebsite.com:80")
      .get("/")
      .reply(404);

    await expect(instance("http://somewebsite.com", defaultContext())).rejects.toThrow();
  });
});
