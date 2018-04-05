# resolver-engine
Inspired by node's require(). Singular API for resolving and parsing imports of any kind from multiple sources

## Target example

```typescript
import { ResolverEngine } from "node-subresolver";
import { NpmResolver, EthPmResolver, FsResolver, GithubResolver } from "eth-subresolvers";
import { SolidityCodeParser } from 'solidity-subresolvers';
import { ZrxArtifactParser } from 'zrx-subresolvers';
import { TruffleArtifactParser } from 'truffle-subresolvers';

const resolverBase = ResolverEngine
    .addSubResolver(new NpmResolver())
    .addSubResolver(new EthPmResolver(onDownloadCallback))
    .addSubResolver(new GithubResolver(MY_GITHUB_TOKEN));

const artifactResolver = resolverBase
    .addSubResolver(new FsResolver("build/artifacts/"))
    .addParser(new TruffleArtifactParser())
    .addParser(new ZrxArtifactParser())
    .build();

const codeResolver = resolverBase
    .addSubResolver(new FsResolver("src/contracts/"))
    .addParser(new SolidityCodeParser())
    .build();

const contract = resolver.require("open-zeppelin/Ownable.sol");

// Some kind of machinery, eg solc
compile(
    "src/contracts/Root.sol",
    (importName) => { `${codeResolver.packageName(importName)}`: codeResolver.require(importName) }
);

if (artifactResolver.resolve("build/contracts/Root.json") == null) {
    console.error("File not found");
}

link("build/artifacts/", (contractName) => codeResolver.require(contractName) );
```
