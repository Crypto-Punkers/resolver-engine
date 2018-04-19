import { ResolverEngine, FsParser, FsResolver, GithubResolver, UrlResolver, NodeResolver } from "../src";

const resolver = new ResolverEngine<string>()
  .addResolver(new FsResolver())
  .addResolver(new NodeResolver())
  .addResolver(new GithubResolver())
  .addResolver(new UrlResolver())
  .addParser(new FsParser());

async function print(path: string) {
  console.log(path);
  const get = resolver.require(path);
  console.log(await get);
}

(async () => {
  await print("github:ritave/resolver-engine/examples/github.ts");
  await print(__filename);
  await print("@types/request/package.json");
  await print("https://pastebin.com/raw/D8ziKX0a");
})().catch(err => {
  console.error(err);
  process.exit(1);
});
