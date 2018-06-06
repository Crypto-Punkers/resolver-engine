import { SolidityImportResolver } from "../src";

const resolver = SolidityImportResolver();

resolver
  .require("@zeppelin-solidity/contracts/Ownable.sol")
  .then(console.log)
  .catch(console.error);
