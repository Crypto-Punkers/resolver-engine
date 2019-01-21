jest.mock("fs");
import deepequal from "deep-equal";
import { vol } from "memfs";
import { SolidityImportResolver } from "../../../src";
import mockedFS from "../../MockedFs";

type input_t = [string, string | undefined];
type output_t = [string, string];

const data: [input_t, output_t][] = [
  [
    ["https://github.com/Crypto-Punkers/resolver-engine/examples/github.ts", undefined],
    ["https://raw.githubusercontent.com/Crypto-Punkers/resolver-engine/master/examples/github.ts", "github"],
  ],
  [
    //            v
    ["https://githób.com/Crypto-Punkers/resolver-engine/examples/github.ts", undefined],
    ["https://xn--githb-3ta.com/Crypto-Punkers/resolver-engine/examples/github.ts", "url"], // TODO, wtf
  ],
  [["package/some/file.txt", "/dir"], ["/dir/node_modules/package/some/file.txt", "node"]],
];

describe("NodeResolver", () => {
  const subject = SolidityImportResolver();
  beforeEach(() => {
    vol.fromJSON(mockedFS);
  });
  afterEach(() => {
    vol.reset();
  });

  it.each(data)("testing %o in context %o", async (input: input_t, output: output_t) => {
    const actualOutput = await subject.resolve(...input);
    const arrayifiedOutput = [actualOutput.url, actualOutput.resolverName]; // it was either 'objectify' output or 'arrayify' actualOutput
    expect(deepequal(arrayifiedOutput, output)).toBe(true);
  });
});
