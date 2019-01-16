import { FsParser } from "../src/parsers";
import { UrlParser } from "../src/parsers/urlparser";
import { ResolverEngine } from "../src/resolverengine";
import { FsResolver, GithubResolver, NodeResolver, UriResolver } from "../src/resolvers";

const resolver = new ResolverEngine<string>()
  .addResolver(FsResolver())
  .addResolver(NodeResolver())
  .addResolver(GithubResolver())
  .addResolver(UriResolver())
  .addParser(UrlParser())
  .addParser(FsParser());

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
