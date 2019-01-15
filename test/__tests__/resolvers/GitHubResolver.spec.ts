import { GithubResolver } from "../../../src/resolvers";

const data = [
  ["", null],
  [
    "https://github.com/Crypto-Punkers/resolver-engine/examples/github.ts",
    "https://api.github.com/repos/Crypto-Punkers/resolver-engine/contents/examples/github.ts",
  ],
  [
    "https://github.com/Crypto-Punkers/resolver-engine/blob/master/examples/github.ts",
    "https://raw.githubusercontent.com/Crypto-Punkers/resolver-engine/master/examples/github.ts",
  ],
  [
    "https://github.com/Crypto-Punkers/resolver-engine/blob/cymerrad/remix-ide-integration/examples/github.ts",
    "https://raw.githubusercontent.com/Crypto-Punkers/resolver-engine/cymerrad/remix-ide-integration/examples/github.ts",
  ],
];

describe("GitHubResolver", () => {
  const subject = GithubResolver();

  it.each(data)("testing %o", async (input, output) => {
    const actualOutput = await subject(input);
    expect(actualOutput).toBe(output);

    // IMPLEMENT ME
  });
});
