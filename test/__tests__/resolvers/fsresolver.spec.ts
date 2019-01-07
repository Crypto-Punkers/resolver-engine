jest.mock("fs");
import * as path from "path";
import { FsParser, FsResolver, SubParser, SubResolver } from "../../../src";
import { defaultContext } from "../../utils";
import { vol } from "memfs";

describe("FsResolver", function() {
  let instance: SubResolver;
  let contentsParser: SubParser<string>;

  beforeAll(function() {
    contentsParser = FsParser();
    instance = FsResolver();
    process.chdir(__dirname);
  });

  afterEach(function() {
    vol.reset();
  });

  describe("without root prefix", function() {
    it("finds absolute paths", async function() {
      vol.fromJSON({
        "/file.test": "correct",
        "./file.test": "wrong",
      });

      const resolved = await instance("/file.test", defaultContext());
      expect(resolved).toEqual("/file.test");
      expect(await contentsParser(resolved!)).toEqual("correct");
    });

    it("finds relative paths", async function() {
      vol.fromJSON({
        "/relative/path/file.test": "wrong",
        "relative/path/file.test": "correct",
      });

      const resolved = await instance("relative/path/file.test", defaultContext());
      expect(resolved).toEqual(path.join(process.cwd(), "relative/path/file.test"));
      expect(await contentsParser(resolved!)).toEqual("correct");
    });

    it("returns null on non-existent", async function() {
      vol.fromJSON({
        "a.test": "a",
        "b.test": "b",
      });

      expect(await instance("c.test", defaultContext())).toBeNull();
    });
  });

  describe("with root prefix", function() {
    const ctx = { ...defaultContext(), cwd: "root" };

    it("appends root prefix", async function() {
      vol.fromJSON({
        "root/dir/file.test": "correct",
        "dir/file.test": "wrong",
      });

      expect(await instance("dir/file.test", ctx)).toEqual("root/dir/file.test");
    });

    it("returns null on failure", async function() {
      vol.fromJSON({
        "a.test": "wrong",
        "root/b.test": "wrong",
      });

      expect(await instance("a.test", ctx)).toBeNull();
    });
  });
});
