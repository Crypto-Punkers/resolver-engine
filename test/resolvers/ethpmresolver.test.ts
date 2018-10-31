import { expect } from "chai";
import MockFs from "mock-fs";
import path from "path";
import process from "process";
import { EthPmResolver, SubResolver } from "../../src";
import { defaultCtx } from "./utils";

describe("EthPmResolver", function() {
  let instance: SubResolver;

  beforeEach(function() {
    instance = EthPmResolver();
  });

  afterEach(function() {
    MockFs.restore();
  });

  it("works", async function() {
    MockFs({
      "installed_contracts/package/file.test": "correct",
    });

    expect(await instance("package/file.test", defaultCtx())).to.be.equal(
      `${process.cwd()}/installed_contracts/package/file.test`,
    );
  });

  it("returns null on failure", async function() {
    MockFs({
      "package/file.test": "wrong",
    });

    expect(await instance("package/file.test", defaultCtx())).to.be.null;
  });

  it("returns null on absolute paths", async function() {
    MockFs({
      "installed_contracts/package/file.test": "wrong",
    });

    expect(await instance("/package/file.test", defaultCtx())).to.be.null;
  });

  it("works above cwd", async function() {
    MockFs({
      "../installed_contracts/package/file.test": "correct",
      "package/file.test": "wrong",
    });

    const expectedPath = path.normalize(`${process.cwd()}/../installed_contracts/package/file.test`);
    expect(await instance("package/file.test", defaultCtx())).to.be.equal(expectedPath);
  });

  it("works without contract/ folder", async function() {
    MockFs({
      "../installed_contracts/package/contracts/file.sol": "correct",
    });

    const expectedPath = path.normalize(`${process.cwd()}/../installed_contracts/package/contracts/file.sol`);

    expect(await instance("package/file.sol", defaultCtx())).to.be.equal(expectedPath);
  });
});
