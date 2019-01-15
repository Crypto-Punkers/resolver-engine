jest.mock("fs");
import { vol } from "memfs";
import { FsResolver } from "../../../src/resolvers";
import mockedFS from "../MockedFs";

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
  beforeEach(() => {
    vol.fromJSON(mockedFS);
  });
  afterEach(() => {
    vol.reset();
  });

  it.each(data)("testing %o in context %o", async (input, context, output) => {
    const actualOutput = await subject(input, context);
    expect(actualOutput).toBe(output);

    // IMPLEMENT ME
  });
});
