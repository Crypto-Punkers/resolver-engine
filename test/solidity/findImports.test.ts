import { expect } from "chai";
import { findImports, ImportFile } from "../../src";

describe("findImports", function() {
  let providedFile: ImportFile = { path: "", source: "" };

  context("Double quotes", function() {
    it('finds statements like: import "file";', function() {
      providedFile.source = 'pragma solidity ^0.5.0;\nimport "./SomeLib.sol";\n\ncontract SomeContract {}\n';
      const result = findImports(providedFile);
      expect(result).to.have.members(["./SomeLib.sol"]);
    });

    it('finds statements like: import "file" as _something_;', function() {
      providedFile.source =
        'pragma solidity ^0.5.0;\nimport "./SomeLib.sol" as OtherLib;\n\ncontract SomeContract {}\n';
      const result = findImports(providedFile);
      expect(result).to.have.members(["./SomeLib.sol"]);
    });

    it('finds statements like: import _something_ from "file";', function() {
      providedFile.source =
        'pragma solidity ^0.5.0;\nimport SomeLib from "./SomeLib.sol";\n\ncontract SomeContract {}\n';
      const result = findImports(providedFile);
      expect(result).to.have.members(["./SomeLib.sol"]);
    });
  });

  context("Single quotes", function() {
    it("finds statements like: import 'file';", function() {
      providedFile.source = "pragma solidity ^0.5.0;\nimport './SomeLib.sol';\n\ncontract SomeContract {}\n";
      const result = findImports(providedFile);
      expect(result).to.have.members(["./SomeLib.sol"]);
    });

    it("finds statements like: import 'file' as _something_;", function() {
      providedFile.source =
        "pragma solidity ^0.5.0;\nimport './SomeLib.sol' as OtherLib;\n\ncontract SomeContract {}\n";
      const result = findImports(providedFile);
      expect(result).to.have.members(["./SomeLib.sol"]);
    });

    it("finds statements like: import _something_ from 'file';", function() {
      providedFile.source =
        "pragma solidity ^0.5.0;\nimport SomeLib from './SomeLib.sol';\n\ncontract SomeContract {}\n";
      const result = findImports(providedFile);
      expect(result).to.have.members(["./SomeLib.sol"]);
    });
  });

  it("finds multiple import statements", function() {
    providedFile.source =
      'pragma solidity ^0.5.0;\nimport "./SomeLib.sol";\nimport "./SomeLib2.sol";\nimport "./SomeLib3.sol";\n\ncontract SomeContract {}\n';
    const result = findImports(providedFile);
    expect(result).to.have.members(["./SomeLib.sol", "./SomeLib2.sol", "./SomeLib3.sol"]);
  });
});
