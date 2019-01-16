import { IPFSResolver } from "../../../src/resolvers";

const data = [
  ["", null],
  ["www.google.com", null],
  ["http://example.com", null],
  ["https://example.com", null],
  ["https://github.com/Crypto-Punkers/resolver-engine/blob/master/examples/github.ts", null],
];

describe.skip("IPFSResolver", () => {
  const subject = IPFSResolver();

  it.each(data)("testing %o", async (input, output) => {
    const actualOutput = await subject(input);
    expect(actualOutput).toBe(output);
  });
});
