import { vol } from "memfs";
import nock from "nock";
import { BrowserCompatibleUrlResolver, FsParser, SubParser, SubResolver } from "../../../src";
import { defaultContext } from "../../utils";

// Debug.enable("resolverengine:main,resolverengine:urlresolver2,resolverengine:fsparser");

describe.skip("UrlResolver", function() {
  let instance: SubResolver;
  let contentsResolver: SubParser<string>;

  beforeAll(function() {
    nock.disableNetConnect();
    contentsResolver = FsParser();
  });

  beforeEach(function() {
    instance = BrowserCompatibleUrlResolver();
  });

  afterEach(function() {
    vol.reset();
    expect(nock.isDone()).toBe(true);
  });

  it("returns null on non-urls", async function() {
    vol.fromJSON({
      "relative/path.file": "wrong",
    });

    expect(await instance("relative/path.file", defaultContext("node"))).toBeNull();
  });

  it("downloads the file", async () => {
    const CONTENTS = "<HTML><HEAD><TITLE>Success</TITLE></HEAD><BODY>Success</BODY></HTML>\n";
    nock("http://captive.apple.com:80")
      .get("/")
      .reply(200, CONTENTS);

    console.log("Before");
    const path = await instance("http://captive.apple.com/", defaultContext("node"));
    console.log("After");
    expect(path).not.toBeNull();
    console.log("More after");
    const contents = await contentsResolver(path!);
    expect("DUPA".toLowerCase()).toEqual("dupa");
    console.log("Got contents", contents, CONTENTS);
    (global as any).asyncDump();
    expect(contents).toEqual(CONTENTS);
    console.log("DONE?");
  });

  it("throws on network error", async function() {
    const ERROR = "test error";
    nock("http://somewebsite.com:80")
      .get("/")
      .replyWithError(ERROR);

    await expect(instance("http://somewebsite.com", defaultContext("node"))).rejects.toThrowError(ERROR);
  });

  it("throws on failure code", async function() {
    nock("http://somewebsite.com:80")
      .get("/")
      .reply(404);

    await expect(instance("http://somewebsite.com", defaultContext("node"))).rejects.toThrow();
  });
});
