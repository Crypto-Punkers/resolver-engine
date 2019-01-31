import { resolvers } from "@resolver-engine/core";

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
  const subject = resolvers.UriResolver();

  it.each(data)("testing %o", async (input, output) => {
    const actualOutput = await subject(input, { resolver: "" });
    expect(actualOutput).toBe(output);
  });
});
