jest.mock("fs");
import { ImportsFsEngine } from "@resolver-engine/imports-fs";
import { vol } from "memfs";
import nock from "nock";
import mockedFS from "../__mocks__/MockedFs";

type input_t = [string, string | undefined];
type output_t = [string, string];

const data: Array<[input_t, output_t]> = [
  [
    ["https://github.com/Crypto-Punkers/resolver-engine/examples/github.ts", undefined],
    ["https://raw.githubusercontent.com/Crypto-Punkers/resolver-engine/master/examples/github.ts", "github"],
  ],
  [
    //            v
    ["https://githób.com/Crypto-Punkers/resolver-engine/examples/github.ts", undefined],
    ["https://xn--githb-3ta.com/Crypto-Punkers/resolver-engine/examples/github.ts", "http"], // TODO, wtf
  ],
  [["package/some/file.txt", "/dir"], ["/dir/node_modules/package/some/file.txt", "node"]],
];

describe("ImportsResolver", () => {
  const subject = ImportsFsEngine();
  beforeAll(() => {
    nock.disableNetConnect();
  });
  beforeEach(() => {
    vol.fromJSON(mockedFS);
  });
  afterEach(() => {
    vol.reset();
  });

  it.each(data)("testing %o in context %o", async (input: input_t, output: output_t) => {
    nock(output[0])
      .get("")
      .reply(200, "doesn't matter");
    const actualOutput = await subject.require(...input);
    const arrayifiedOutput = [actualOutput.url, actualOutput.provider]; // it was either 'objectify' output or 'arrayify' actualOutput
    expect(arrayifiedOutput).toEqual(output);
  });
});
