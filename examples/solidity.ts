import { SolidityImportResolver } from "../src";

const resolver = SolidityImportResolver();

resolver
  .require("@openzeppelin-solidity/contracts/ownership/Ownable.sol")
  .then(console.log)
  .catch(console.error);
