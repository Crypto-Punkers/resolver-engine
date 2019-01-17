import { BrowserImportResolver, SolidityImportResolver } from "./solidity";

const defaultResolver = SolidityImportResolver();

export { SolidityImportResolver, BrowserImportResolver };

export default defaultResolver;
