import { ResolverEngine } from "@resolver-engine/core";
import { parsers as fs_parsers, resolvers as fs_resolvers } from "@resolver-engine/fs";
import { ImportFile, ImportsEngine, parsers as imports_parsers } from "@resolver-engine/imports";
import { EthPmResolver } from "./resolvers/ethpmresolver";

export function ImportsFsEngine(): ResolverEngine<ImportFile> {
  return ImportsEngine()
    .addResolver(fs_resolvers.FsResolver())
    .addResolver(fs_resolvers.NodeResolver())
    .addResolver(EthPmResolver())
    .addParser(imports_parsers.ImportParser([fs_parsers.FsParser()]));
}
