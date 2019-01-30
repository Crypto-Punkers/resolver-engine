import { UrlParser } from "./parsers/index";
import { UriResolver } from "./resolvers/index";
export { SubParser } from "./parsers/index";
export * from "./resolverengine";
export { SubResolver } from "./resolvers/index";
export * from "./utils";

export const resolvers = {
  UriResolver,
};

export const parsers = {
  UrlParser,
};
