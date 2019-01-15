import { FsResolver } from "../../../src/resolvers";

const data = [
  ["/path/to/file.txt", { cwd: "/" }, "/path/to/file.txt"],
  ["/path/to/file.txt", { cwd: "/path" }, "/path/to/file.txt"],
  ["/path/to/file.txt", { cwd: "/somewhere/else" }, "/path/to/file.txt"],
  ["/path/to/nofile.lol", { cwd: "/" }, null],
  ["/path/to/nofile.lol", { cwd: "/path/to" }, null],
  ["not-a-path", { cwd: "/path" }, null],
  ["", { cwd: "." }, null],
  [".", { cwd: "." }, null],
];

describe("FsResolver", () => {
  const subject = FsResolver();

  it.each(data)("testing %o", async (input, context, output) => {
    const actualOutput = await subject(input, context);
    expect(actualOutput).toBe(output);

    // IMPLEMENT ME
  });
});
