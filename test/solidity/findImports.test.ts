// import { expect } from "chai";
// import { findImports, ImportFile } from "../../src";

describe("findImports", function() {
    context("Double quotes", function() {
        it("finds statements like: import \"file\";");
        it("finds statements like: import \"file\" as _something_;");
        it("finds statements like: import _something_ from \"file\";");
    });

    context("Single quotes", function() {
        it("finds statements like: import 'file';");
        it("finds statements like: import 'file' as _something_;");
        it("finds statements like: import _something_ from 'file';");
    });

    it("finds multiple import statements");
});
