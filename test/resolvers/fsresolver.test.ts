import { expect } from "chai";
import MockFs from "mock-fs";
import { FsParser, FsResolver, SubParser, SubResolver } from "../../src";

describe("FsResolver", function() {
  let instance: SubResolver;
  let contentsParser: SubParser<string>;

  before(function() {
    contentsParser = FsParser();
  });

  afterEach(function() {
    MockFs.restore();
  });

  context("without root preffix", function() {
    beforeEach(function() {
      instance = FsResolver();
    });

    it("finds absolute paths", async function() {
      MockFs({
        "/file.test": "correct",
        "file.test": "wrong",
      });

      const path = await instance("/file.test");
      expect(path).to.be.equal("/file.test");
      expect(await contentsParser(path!)).to.be.equal("correct");
    });

    it("finds relative paths", async function() {
      MockFs({
        "/relative/path/file.test": "wrong",
        "relative/path/file.test": "correct",
      });

      const path = await instance("relative/path/file.test");
      expect(path).to.be.equal("relative/path/file.test");
      expect(await contentsParser(path!)).to.be.equal("correct");
    });

    it("returns null on non-existent", async function() {
      MockFs({
        "a.test": "a",
        "b.test": "b",
      });

      expect(await instance("c.test")).to.be.null;
    });
  });

  context("with root preffix", function() {
    beforeEach(function() {
      instance = FsResolver("root");
    });

    it("appends root preffix", async function() {
      MockFs({
        "root/dir/file.test": "correct",
        "dir/file.test": "wrong",
      });

      expect(await instance("dir/file.test")).to.be.equal("root/dir/file.test");
    });

    it("returns null on failure", async function() {
      MockFs({
        "a.test": "wrong",
        "root/b.test": "wrong",
      });

      expect(await instance("a.test")).to.be.null;
    });
  });
});
