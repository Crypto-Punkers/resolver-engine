import { FSWrapper, MemFSWrapped, requestGetViaRequest, RequestGet_t, tmpFileViaSomeFS, TmpFile_t } from "../src";
import { BrowserService, env_t, IResolverServiceLayer, ResolverContext } from "../src/context";

export function defaultContext(environment?: env_t): ResolverContext {
  return {
    cwd: process.cwd(),
    environment: environment,
    system: getSystem(environment),
  } as ResolverContext;
}

function getSystem(env?: env_t): IResolverServiceLayer {
  if (env === "browser") {
    return new BrowserService();
  } else {
    return new TestService();
  }
}

export class TestService implements IResolverServiceLayer {
  public fs: FSWrapper;
  public requestGet: RequestGet_t;
  public tmpFile: TmpFile_t;
  constructor() {
    this.fs = new MemFSWrapped();
    this.requestGet = requestGetViaRequest;
    this.tmpFile = tmpFileViaSomeFS(this.fs);
  }
}
