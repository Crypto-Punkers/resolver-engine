**This is a fork of the [original project](Crypto-Punkers/resolver-engine) developed by the Crypto-Punkers team, re-released by OpenZeppelin with additional fixes.**

<p align="center">
  <img src="doc/Logo@2x.png?raw=true">
  <p align="center">Single API for resolving Solidity artefacts and imports</p>
</p>

## Example usage

We provide a pre-built complete engine with _sane_ defaults.
Resolver-engine is a common importing interface for _all_ the Ethereum inventions out there.

```typescript
import { ImportFsEngine } from "@openzeppelin/resolver-engine-import-fs";

ImportFsEngine()
  .require("github:OpenZeppelin/openzeppelin-solidity/contracts/ownership/Ownable.sol#v2.1.2")
  .then(file => console.log(`Loaded url ${file.url} with source: ${file.source}`);
```

Otherwise, you can build your own engines, suited to your needs.

```typescript
import { ResolverEngine } from "@openzeppelin/resolver-engine-core";
import { parsers, resolvers } from "@openzeppelin/resolver-engine-imports-fs";

const resolver = new ResolverEngine<string>()
  .addResolver(resolvers.FsResolver())
  .addResolver(resolvers.NodeResolver())
  .addParser(parsers.FsParser());

resolver
  .resolve("@openzeppelin-solidity/contracts/ownership/Ownable.sol")
  .then(fileSource => console.log(fileSource))
  .catch(console.error);
```

```typescript
import { parsers, resolvers, ResolverEngine } from "@openzeppelin/resolver-engine-core";

const resolver = new ResolverEngine<string>().addResolver(resolvers.UriResolver()).addParser(parsers.UrlParser());

resolver.resolve("https://pastebin.com/raw/D8ziKX0a").then(console.log);
```

In the [`examples/` folder](examples/) more granular examples can be found.

### Published packages

| Package                                               | NPM                                                                                                                             | Description                                                                  |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| [`@openzeppelin/resolver-engine-imports-fs`](/packages/imports-fs) | [![npm link](https://img.shields.io/badge/npm-imports--fs-blue.svg)](https://www.npmjs.com/package/@openzeppelin/resolver-engine-imports-fs) | Solidity imports with filesystem support                                     |
| [`@openzeppelin/resolver-engine-imports`](/packages/imports)       | [![npm link](https://img.shields.io/badge/npm-imports-blue.svg)](https://www.npmjs.com/package/@openzeppelin/resolver-engine-imports)        | Browser-friendly version of Solidity imports                                 |
| [`@openzeppelin/resolver-engine-core`](packages/core)              | [![npm link](https://img.shields.io/badge/npm-core-blue.svg)](https://www.npmjs.com/package/@openzeppelin/resolver-engine-core)              | Core of the project consisting of the engine and interfaces                  |
| [`@openzeppelin/resolver-engine-fs`](packages/fs)                  | [![npm link](https://img.shields.io/badge/npm-fs-blue.svg)](https://www.npmjs.com/package/@openzeppelin/resolver-engine-fs)                  | Filesystem abstractions, basis for future artifacts resolver and many others |

## Long description

Each Solidity framework has different logic concerning Solidity import statements as well as creating different format of artifacts. This becomes problematic when target developers want to use multiple tools on the same codebase.

For example, Truffle artifacts are not compatible with 0xProject's solidity coverage tooling. Documentation generation doesn't support NPM-like Solidity imports which are supported by both Truffle and 0x, at the same time, neither of which support github import statements as the ones Remix does.

The goal of this library is to provide tooling for framework developers so that they can implement multiple artifacts and solidity importing with ease, as well as providing sane defaults that would standarize the functionallity.

<p align="center">
  <img src="doc/SequenceRender.png?raw=true">
</p>
