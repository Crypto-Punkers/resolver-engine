import { expect } from "chai";
import MockFs from "mock-fs";
// import * as path from "path";
import { gatherSources, ResolverEngine, SolidityImportResolver, ImportFile } from "../../src";

describe("gatherSources function", function() {
    let resolver: ResolverEngine<ImportFile> = SolidityImportResolver();

     afterEach(function() {
        MockFs.restore();
    });
    
    it("gathers files included by given file", async function() {
        MockFs({
            "mainfile.sol": 'blahblah;\nimport "./otherfile.sol";\nimport "./somethingelse.sol";\nrestoffileblahblah',
            "otherfile.sol": "otherfilecontents",
            "somethingelse.sol": "somethingelsecontents"
        });
        const fileList = await gatherSources("mainfile.sol", process.cwd(), resolver);
        expect(fileList).to.have.deep.members([
            {
                path: process.cwd() + '/mainfile.sol',
                source: 'blahblah;\nimport "./otherfile.sol";\nimport "./somethingelse.sol";\nrestoffileblahblah'
            },
            {
                path: process.cwd() + '/otherfile.sol',
                source: 'otherfilecontents'
            },
            {
                path: process.cwd() + '/somethingelse.sol',
                source: 'somethingelsecontents'
            }
        ]);
    });

    it("gathers all files required to compile");
    it("does not include the same file twice");
    it("works without passing resolver to it");

    
});
