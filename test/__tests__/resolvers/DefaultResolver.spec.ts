import { DefaultResolver } from "../../../src/resolvers";

const data = [
  ["", null],
  ["www.google.com", null],
  ["http://example.com", "http://example.com/"],
  ["https://example.com/", "https://example.com/"],
  [
    "https://github.com/Crypto-Punkers/resolver-engine/blob/master/examples/github.ts",
    "https://github.com/Crypto-Punkers/resolver-engine/blob/master/examples/github.ts",
  ],
];

describe("UriResolver", () => {
  const subject = DefaultResolver();

  it.each(data)("testing %o", async (input, output) => {
    const actualOutput = await subject(input, {});
    if (actualOutput === null) {
      expect(actualOutput).toBe(output);
    } else {
      expect(actualOutput.url).toBe(output);
    }
  });
});
