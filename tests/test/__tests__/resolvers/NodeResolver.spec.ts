jest.mock("fs");
import { resolvers } from "@resolver-engine/imports-fs";
import { vol } from "memfs";
import mockedFS from "../../MockedFs";

const data = [
  ["package/some/file.txt", { cwd: "/dir" }, "/dir/node_modules/package/some/file.txt"],
  ["package/some/file.txt", { cwd: "/dir/some" }, "/dir/node_modules/package/some/file.txt"],
  ["package/some/file.txt", { cwd: "/dir/project" }, "/dir/node_modules/package/some/file.txt"],
  ["package/some/file.txt", { cwd: "/dir/project/sumdir" }, "/dir/node_modules/package/some/file.txt"],
  ["package/some/file.txt", { cwd: "/path" }, null],
  ["to/file.txt", { cwd: "/" }, null],
  ["to/file.txt", { cwd: "/path" }, null],
  ["to/file.txt", { cwd: "/dir" }, null],
  ["to/file.txt", { cwd: "/eth" }, null],
  ["to/file.txt", { cwd: "/path/to" }, null],
];

describe("NodeResolver", () => {
  const subject = resolvers.NodeResolver();
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
