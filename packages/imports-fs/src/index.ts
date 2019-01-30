export { ImportsFsEngine } from "./importsfsengine";
import { parsers as fs_p, resolvers as fs_r } from "@resolver-engine/fs";
import { parsers as imp_p, resolvers as imp_r } from "@resolver-engine/imports";
import { EthPmResolver } from "./resolvers";

export const resolvers = {
  EthPmResolver,
  ...fs_r,
  ...imp_r,
};

export const parsers = {
  ...fs_p,
  ...imp_p,
};
