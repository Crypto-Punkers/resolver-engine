import { BrowserImportResolver, SolidityImportResolver } from "./solidity";

const defaultResolver = SolidityImportResolver();
const browserResolver = BrowserImportResolver();

export { SolidityImportResolver, BrowserImportResolver };
export { browserResolver as browser, defaultResolver as default };

// so it seems like default exports cause problems all around
// one of the voices against them, voice that we know personally:
// https://blog.neufund.org/why-we-have-banned-default-exports-and-you-should-do-the-same-d51fdc2cf2ad
