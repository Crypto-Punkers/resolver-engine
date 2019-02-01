import { ImportsFsEngine } from "@resolver-engine/imports-fs";

const resolver = ImportsFsEngine();

resolver
  .require("github:openZeppelin/openzeppelin-solidity/contracts/ownership/Ownable.sol")
  .then(console.log)
  .catch(console.error);
