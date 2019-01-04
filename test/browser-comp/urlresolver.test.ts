import chai from "chai";
import { fs as memfs } from "memfs";
import MockFs from "mock-fs";
import nock from "nock";
import { FsParser, SubParser, SubResolver } from "../../src";
import "../utils/setup";
import { defaultContext } from "./utils";
import { BrowserCompatibleUrlResolver } from "../../src/browser-comp/urlresolver";
import Debug from "debug";

const expect = chai.expect;
(MockFs.fs as any) = memfs;

Debug.enable("resolverengine:main,resolverengine:urlresolver2,resolverengine:fsparser");

describe("UrlResolver", function () {
	let instance: SubResolver;
	let contentsResolver: SubParser<string>;

	before(function () {
		nock.disableNetConnect();
		contentsResolver = FsParser();
	});

	beforeEach(function () {
		instance = BrowserCompatibleUrlResolver();
	});

	afterEach(function () {
		MockFs.restore();
		expect(nock.isDone()).to.be.true;
	});

	it("returns null on non-urls", async function () {
		MockFs({
			"relative/path.file": "wrong",
		});

		expect(await instance("relative/path.file", defaultContext("node"))).to.be.null;
	});

	it("downloads the file", async () => {
		const CONTENTS = "<HTML><HEAD><TITLE>Success</TITLE></HEAD><BODY>Success</BODY></HTML>\n";
		nock("http://captive.apple.com:80")
			.get("/")
			.reply(200, CONTENTS);

		console.log("Before");
		const path = await instance("http://captive.apple.com/", defaultContext("node"));
		console.log("After");
		expect(path).to.not.be.null;
		console.log("More after");
		const contents = await contentsResolver(path!);
		expect("DUPA".toLowerCase()).to.be.equal("dupa");
		console.log("Got contents", contents, CONTENTS);
		(global as any).asyncDump();
		expect(contents).to.be.equal(CONTENTS);
		console.log("DONE?");
	});

	it("throws on network error", async function () {
		const ERROR = "test error";
		nock("http://somewebsite.com:80")
			.get("/")
			.replyWithError(ERROR);

		await expect(instance("http://somewebsite.com", defaultContext("node"))).to.eventually.be.rejectedWith(ERROR);
	});

	it("throws on failure code", async function () {
		nock("http://somewebsite.com:80")
			.get("/")
			.reply(404);

		await expect(instance("http://somewebsite.com", defaultContext("node"))).to.eventually.be.rejected;
	});
});
