jest.mock("fs");
import { vol } from "memfs";
import { resolvers } from "../../../../packages/imports-fs/src";
import mockedFS from "../../MockedFs";

const data = [
  ["zeppelin/contract.sol", { cwd: "/eth" }, "/eth/contracts/zeppelin/contract.sol"],
  ["zeppelin/contract.sol", { cwd: "/" }, null],
  ["zeppelin/contract.sol", { cwd: "/eth/contracts" }, "/eth/contracts/zeppelin/contract.sol"],
  ["zeppelin/contract.sol", { cwd: "/eth/someproject" }, "/eth/contracts/zeppelin/contract.sol"],
  ["zeppelin/contract.sol", { cwd: "/path/to" }, null],
  ["ledzeppelin/othercontract.sol", { cwd: "/eth" }, "/eth/installed_contracts/ledzeppelin/othercontract.sol"],
  ["ledzeppelin/othercontract.sol", { cwd: "/" }, null],
  [
    "ledzeppelin/othercontract.sol",
    { cwd: "/eth/installed_contracts" },
    "/eth/installed_contracts/ledzeppelin/othercontract.sol",
  ],
  [
    "ledzeppelin/othercontract.sol",
    { cwd: "/eth/someproject" },
    "/eth/installed_contracts/ledzeppelin/othercontract.sol",
  ],
  ["ledzeppelin/othercontract.sol", { cwd: "/path/to" }, null],
  ["to/file.txt", { cwd: "/" }, null],
  ["to/file.txt", { cwd: "/path" }, null],
  ["to/file.txt", { cwd: "/eth" }, null],
  ["to/file.txt", { cwd: "/eth/contracts" }, null],
  ["to/file.txt", { cwd: "/eth/installed_contracts" }, null],
];

describe("EthPmResolver", () => {
  const subject = resolvers.EthPmResolver();
  beforeEach(() => {
    vol.fromJSON(mockedFS);
  });
  afterEach(() => {
    vol.reset();
  });

  it.each(data)("testing %o in context %o", async (input, context, output) => {
    const actualOutput = await subject(input, context);
    expect(actualOutput).toBe(output);
  });
});
