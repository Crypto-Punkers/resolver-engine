import { expect } from "chai";
import MockFs from "mock-fs";
import { gatherSources, ResolverEngine, SolidityImportResolver, ImportFile } from "../../src";

function expectedOutput(filesObj: { [s: string]: string }): ImportFile[] {
  let result = [];
  for (let k of Object.keys(filesObj)) {
    result.push({
      path: process.cwd() + "/" + k,
      source: filesObj[k],
    });
  }
  return result;
}

describe("gatherSources function", function() {
  const resolver: ResolverEngine<ImportFile> = SolidityImportResolver();

  afterEach(function() {
    MockFs.restore();
  });

  it("gathers files included by given file", async function() {
    const files: { [s: string]: string } = {
      "mainfile.sol": 'blahblah;\nimport "./otherfile.sol";\nimport "./somethingelse.sol";\nrestoffileblahblah',
      "otherfile.sol": "otherfilecontents",
      "somethingelse.sol": "somethingelsecontents",
    };
    const expectedFiles = expectedOutput(files);

    MockFs(files);
    const fileList = await gatherSources("mainfile.sol", process.cwd(), resolver);
    expect(fileList).to.have.deep.members(expectedFiles);
  });

  it("gathers files imported by imported files", async function() {
    const files: { [s: string]: string } = {
      "mainfile.sol": 'blahblah;\nimport "./otherfile.sol";\nrestoffileblahblah',
      "otherfile.sol": 'hurrdurr;\nimport "./contracts/something.sol";\nblahblah',
      "contracts/something.sol": "filecontents",
    };
    const expectedFiles = expectedOutput(files);

    MockFs(files);
    const fileList = await gatherSources("mainfile.sol", process.cwd(), resolver);
    expect(fileList).to.have.deep.members(expectedFiles);
  });

  it("does not include the same file twice", async function() {
    const files: { [s: string]: string } = {
      "mainfile.sol": 'blahblah;\nimport "./otherfile.sol";\nimport "./somethingelse.sol";\nrestoffileblahblah',
      "otherfile.sol": 'otherfilecontents;\nimport "./somethingelse.sol";\nsmthsmth',
      "somethingelse.sol": "somethingelsecontents",
    };
    const expectedFiles = expectedOutput(files);

    MockFs(files);
    const fileList = await gatherSources("mainfile.sol", process.cwd());
    expect(fileList).to.have.deep.members(expectedFiles);
  });

  it("works without passing resolver to it", async function() {
    const files: { [s: string]: string } = {
      "mainfile.sol": 'blahblah;\nimport "./otherfile.sol";\nrestoffileblahblah',
      "otherfile.sol": "herpderp",
    };
    const expectedFiles = expectedOutput(files);

    MockFs(files);
    const fileList = await gatherSources("mainfile.sol", process.cwd());
    expect(fileList).to.have.deep.members(expectedFiles);
  });
});
