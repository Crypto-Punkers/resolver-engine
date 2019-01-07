jest.mock('fs');
import path from "path";
import process from "process";
import { EthPmResolver, SubResolver } from "../../src";
import { defaultContext } from "../utils";
import { vol } from "memfs";

describe("EthPmResolver", function () {
  let instance: SubResolver;

  beforeAll(function () {
    process.chdir(__dirname);
  })

  beforeEach(function () {
    instance = EthPmResolver();
  });

  afterEach(function () {
    vol.reset();
  });

  it("works", async function () {
    vol.fromJSON({
      "installed_contracts/package/file.test": "correct",
    });

    expect(await instance("package/file.test", defaultContext())).toEqual(
      `${process.cwd()}/installed_contracts/package/file.test`,
    );
  });

  it("returns null on failure", async function () {
    vol.fromJSON({
      "package/file.test": "wrong",
    });

    expect(await instance("package/file.test", defaultContext())).toBeNull();
  });

  it("returns null on absolute paths", async function () {
    vol.fromJSON({
      "installed_contracts/package/file.test": "wrong",
    });

    expect(await instance("/package/file.test", defaultContext())).toBeNull();
  });

  it("works above cwd", async function () {
    vol.fromJSON({
      "../installed_contracts/package/file.test": "correct",
      "package/file.test": "wrong",
    });

    const expectedPath = path.normalize(`${process.cwd()}/../installed_contracts/package/file.test`);
    expect(await instance("package/file.test", defaultContext())).toEqual(expectedPath);
  });

  it("works without contract/ folder", async function () {
    vol.fromJSON({
      "../installed_contracts/package/contracts/file.sol": "correct",
    });

    const expectedPath = path.normalize(`${process.cwd()}/../installed_contracts/package/contracts/file.sol`);

    expect(await instance("package/file.sol", defaultContext())).toEqual(expectedPath);
  });
});
