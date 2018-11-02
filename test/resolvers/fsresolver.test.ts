import { expect } from "chai";
import MockFs from "mock-fs";
import * as path from "path";
import { FsParser, FsResolver, SubParser, SubResolver } from "../../src";
import { defaultContext } from "./utils";

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

      const path = await instance("/file.test", defaultContext());
      expect(path).to.be.equal("/file.test");
      expect(await contentsParser(path!)).to.be.equal("correct");
    });

    it("finds relative paths", async function() {
      MockFs({
        "/relative/path/file.test": "wrong",
        "relative/path/file.test": "correct",
      });

      const resolved = await instance("relative/path/file.test", defaultContext());
      expect(resolved).to.be.equal(path.join(process.cwd(), "relative/path/file.test"));
      expect(await contentsParser(resolved!)).to.be.equal("correct");
    });

    it("returns null on non-existent", async function() {
      MockFs({
        "a.test": "a",
        "b.test": "b",
      });

      expect(await instance("c.test", defaultContext())).to.be.null;
    });
  });

  context("with root preffix", function() {
    const ctx = { ...defaultContext(), cwd: "root" };
    beforeEach(function() {
      instance = FsResolver();
    });

    it("appends root preffix", async function() {
      MockFs({
        "root/dir/file.test": "correct",
        "dir/file.test": "wrong",
      });

      expect(await instance("dir/file.test", ctx)).to.be.equal("root/dir/file.test");
    });

    it("returns null on failure", async function() {
      MockFs({
        "a.test": "wrong",
        "root/b.test": "wrong",
      });

      expect(await instance("a.test", ctx)).to.be.null;
    });
  });
});
