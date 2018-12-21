import { expect } from "chai";
import MockFs from "mock-fs";
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

    it("gathers files imported by imported files", async function() {
        MockFs({
            "mainfile.sol": 'blahblah;\nimport "./otherfile.sol";\nrestoffileblahblah',
            "otherfile.sol": 'hurrdurr;\nimport "./contracts/something.sol";\nblahblah',
            "contracts/something.sol": 'filecontents'
        });

        const fileList = await gatherSources("mainfile.sol", process.cwd(), resolver);
        expect(fileList).to.have.deep.members([
            {
                path: process.cwd() + '/mainfile.sol',
                source: 'blahblah;\nimport "./otherfile.sol";\nrestoffileblahblah'
            },
            {
                path: process.cwd() + '/otherfile.sol',
                source: 'hurrdurr;\nimport "./contracts/something.sol";\nblahblah'
            },
            {
                path: process.cwd() + '/contracts/something.sol',
                source: 'filecontents'
            }
        ]);
    });

    it("does not include the same file twice", async function() {
        MockFs({
            "mainfile.sol": 'blahblah;\nimport "./otherfile.sol";\nimport "./somethingelse.sol";\nrestoffileblahblah',
            "otherfile.sol": 'otherfilecontents;\nimport "somethingelse.sol";\nsmthsmth',
            "somethingelse.sol": "somethingelsecontents"
        });
        const fileList = await gatherSources("mainfile.sol", process.cwd());
        expect(fileList).to.have.deep.members([
            {
                path: process.cwd() + '/mainfile.sol',
                source: 'blahblah;\nimport "./otherfile.sol";\nimport "./somethingelse.sol";\nrestoffileblahblah'
            },
            {
                path: process.cwd() + '/otherfile.sol',
                source: 'otherfilecontents;\nimport "somethingelse.sol";\nsmthsmth'
            },
            {
                path: process.cwd() + '/somethingelse.sol',
                source: "somethingelsecontents"
            }
        ]);
    });

    it("works without passing resolver to it", async function() {
        MockFs({
            "mainfile.sol": 'blahblah;\nimport "./otherfile.sol";\nrestoffileblahblah',
            "otherfile.sol": 'herpderp'
        });
        const fileList = await gatherSources("mainfile.sol", process.cwd());
        expect(fileList).to.have.deep.members([
            {
                path: process.cwd() + '/mainfile.sol',
                source: 'blahblah;\nimport "./otherfile.sol";\nrestoffileblahblah'
            },
            {
                path: process.cwd() + '/otherfile.sol',
                source: 'herpderp'
            }
        ]);
    });

    
});
