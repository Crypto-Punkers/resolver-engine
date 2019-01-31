import { ResolverEngine } from "@resolver-engine/core";
import { resolvers, parsers} from "@resolver-engine/imports-fs";

const resolver = new ResolverEngine<string>()
  .addResolver(resolvers.FsResolver())
  .addResolver(resolvers.NodeResolver())
  .addResolver(resolvers.GithubResolver())
  .addResolver(resolvers.UriResolver())
  .addParser(parsers.UrlParser())
  .addParser(parsers.FsParser());

async function print(path: string) {
  console.log(path);
  const get = resolver.require(path);
  console.log(await get);
}

(async () => {
  await print("github:crypto-punkers/resolver-engine/examples/github.ts");
  await print(__filename);
  await print("@types/request/package.json");
  await print("https://pastebin.com/raw/D8ziKX0a");
})().catch(err => {
  console.error(err);
  process.exit(1);
});
