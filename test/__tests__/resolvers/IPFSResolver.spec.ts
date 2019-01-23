import { IPFSResolver } from "../../../src/resolvers";

const data = [
  ["", null],
  ["www.google.com", null],
  ["http://example.com", null],
  ["https://example.com", null],
  ["https://github.com/Crypto-Punkers/resolver-engine/blob/master/examples/github.ts", null],
  ["ipfs://123/path/to/resource", "https://gateway.ipfs.io/ipfs/123/path/to/resource"],
];

describe("IPFSResolver", () => {
  const subject = IPFSResolver();

  it.each(data)("testing %o", async (input, output) => {
    const actualOutput = await subject(input, {});
    if (actualOutput === null) {
      expect(actualOutput).toBe(output);
    } else {
      expect(actualOutput.url).toBe(output);
    }
  });
});
