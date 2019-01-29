import { FsParser, FsResolver, NodeResolver } from "@resolver-engine/fs";
import { ImportParser, ImportsEngine } from "@resolver-engine/imports";
import { EthPmResolver } from "./resolvers/ethpmresolver";

export function ImportsFsEngine() {
  return ImportsEngine()
    .addResolver(FsResolver())
    .addResolver(NodeResolver())
    .addResolver(EthPmResolver())
    .addParser(ImportParser([FsParser()]));
}
