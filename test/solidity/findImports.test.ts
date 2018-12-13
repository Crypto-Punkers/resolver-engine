import { expect } from "chai";
import { findImports, ImportFile } from "../../src";

describe("findImports", function() {
    let providedFile: ImportFile = {path: "", source: ""};

    context("Double quotes", function() {
        it("finds statements like: import \"file\";", async function() {
            providedFile.source = 'pragma solidity ^0.5.0;\nimport "./SomeLib.sol";\n\ncontract SomeContract {}\n';
            const result = findImports(providedFile);
            expect(result).to.have.members(["./SomeLib.sol"]);
        });

        it("finds statements like: import \"file\" as _something_;", async function() {
            providedFile.source = 'pragma solidity ^0.5.0;\nimport "./SomeLib.sol" as OtherLib;\n\ncontract SomeContract {}\n';
            const result = findImports(providedFile);
            expect(result).to.have.members(["./SomeLib.sol"]);
        });

        it("finds statements like: import _something_ from \"file\";", async function() {
            providedFile.source = 'pragma solidity ^0.5.0;\nimport SomeLib from "./SomeLib.sol";\n\ncontract SomeContract {}\n';
            const result = findImports(providedFile);
            expect(result).to.have.members(["./SomeLib.sol"]);
        });
    });

    context("Single quotes", function() {
        it("finds statements like: import 'file';", async function() {
            providedFile.source = "pragma solidity ^0.5.0;\nimport './SomeLib.sol';\n\ncontract SomeContract {}\n";
            const result = findImports(providedFile);
            expect(result).to.have.members(["./SomeLib.sol"]);
        });

        it("finds statements like: import 'file' as _something_;", async function() {
            providedFile.source = "pragma solidity ^0.5.0;\nimport './SomeLib.sol' as OtherLib;\n\ncontract SomeContract {}\n";
            const result = findImports(providedFile);
            expect(result).to.have.members(["./SomeLib.sol"]);
        });

        it("finds statements like: import _something_ from 'file';", async function() {
            providedFile.source = "pragma solidity ^0.5.0;\nimport SomeLib from './SomeLib.sol';\n\ncontract SomeContract {}\n";
            const result = findImports(providedFile);
            expect(result).to.have.members(["./SomeLib.sol"]);
        });
    });

    it("finds multiple import statements");
});
