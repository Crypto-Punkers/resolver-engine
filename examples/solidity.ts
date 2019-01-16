import { SolidityImportResolver } from "../src/solidity";

const resolver = SolidityImportResolver();

resolver
  .require("@zeppelin-solidity/contracts/Ownable.sol")
  .then(console.log)
  .catch(console.error);
