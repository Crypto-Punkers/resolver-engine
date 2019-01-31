<p align="center">
  <img src="doc/Logo@2x.png?raw=true">
  <p align="center">Single API for resolving Solidity artefacts and imports</p>

  <p align="center">
    <a href="https://t.me/resolverengine"><img alt="Chat on telegram" src="https://img.shields.io/badge/chat-on%20telegram-blue.svg" /></a>
    <a href="https://circleci.com/gh/Crypto-Punkers/resolver-engine/tree/master"><img alt="Build status" src="https://img.shields.io/circleci/project/github/Crypto-Punkers/resolver-engine/master.svg" /></a>
  </p>
</p>

## Example usage

We provide a pre-built complete engine with _sane_ defaults.
Resolver-engine is a common importing interface for _all_ the Ethereum inventions out there.

```typescript
import { ImportsFsEngine } from "@resolver-engine/imports-fs";

const resolver = ImportsFsEngine();

// these all resolve the same resource
resolver
  .require("@zeppelin-solidity/contracts/Ownable.sol")
  .then(console.log)
  .require("github:openZeppelin/openzeppelin-solidity/contracts/ownership/Ownable.sol")
  .then(console.log)
  .require("https://github.com/OpenZeppelin/openzeppelin-solidity/blob/master/contracts/ownership/Secondary.sol")
  .then(console.log)
  .require("https://github.com/OpenZeppelin/openzeppelin-solidity/contracts/ownership/Secondary.sol")
  .then(console.log)
  .catch(console.error);

// first contract released, compatible with solidity ^0.4.24
resolver
  .require("https://github.com/OpenZeppelin/openzeppelin-solidity/blob/f12817e446fcd3d7212fe307bb17424ceb28f0b9/contracts/ownership/Ownable.sol")
  .then(console.log)
  .require("github:openZeppelin/openzeppelin-solidity/contracts/ownership/Ownable.sol#f12817e446fcd3d7212fe307bb17424ceb28f0b9")
  .then(console.log)
  .catch(console.error);
```

Otherwise, you can build your own engines, suited to your needs.

```typescript
import { ResolverEngine } from "@resolver-engine/core";
import { parsers, resolvers } from "@resolver-engine/imports-fs";

const resolver = new ResolverEngine<string>()
  .addResolver(resolvers.FsResolver())
  .addResolver(resolvers.NodeResolver())
  .addParser(parsers.FsParser());

resolver
  .resolve("@openzeppelin-solidity/contracts/ownership/Ownable.sol")
  .then(console.log)
  .catch(console.error);
```

```typescript
import { parsers, resolvers, ResolverEngine } from "@resolver-engine/core";

const resolver = new ResolverEngine<string>()
  .addResolver(resolvers.UriResolver())
  .addParser(parsers.UrlParser());

resolver
  .resolve("https://pastebin.com/raw/D8ziKX0a")
  .then(console.log);
```

In the [`examples/` folder](examples/) more granular examples can be found.

### Published packages

| Package                                               | NPM                                                                                                                                   | Description                                                                  |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| [`@resolver-engine/core`](packages/core)              | [![npm link](https://img.shields.io/badge/npm-core-blue.svg)](https://www.npmjs.com/package/@resolver-engine/core)                    | Core of the object consisting of the core engine and interfaces              |
| [`@resolver-engine/fs`](packages/fs)                  | [![npm link](https://img.shields.io/badge/npm-tslint--rules-blue.svg)](https://www.npmjs.com/package/@resolver-engine/fs)             | Filesystem abstractions, basis for future artifacts resolver and many others |
| [`@resolver-engine/imports`](/packages/imports)       | [![npm link](https://img.shields.io/badge/npm-utils-blue.svg)](https://www.npmjs.com/package/@resolver-engine/imports)                | Browser-friendly version of the resolver                                     |
| [`@resolver-engine/imports-fs`](/packages/imports-fs) | [![npm link](https://img.shields.io/badge/npm-typescript--types-blue.svg)](https://www.npmjs.com/package/@resolver-engine/imports-fs) | Light-weight, but still capable of doing everything mentioned above          |

## Long description

Each Solidity framework has different logic concerning Solidity import statements as well as creating different format of artifacts. This becomes problematic when target developers want to use multiple tools on the same codebase.

For example, Truffle artifacts are not compatible with 0xProject's solidity coverage tooling. Documentation generation doesn't support NPM-like Solidity imports which are supported by both Truffle and 0x, at the same time, neither of which support github import statements as the ones Remix does.

The goal of this library is to provide tooling for framework developers so that they can implement multiple artifacts and solidity importing with ease, as well as providing sane defaults that would standarize the functionallity.

<p align="center">
  <img src="doc/SequenceRender.png?raw=true">
</p>
