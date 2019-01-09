import { Cache, MemFSWrapped } from "../src/context/fs";
import {
  IResolverServiceLayer,
  requestGetViaRequest,
  RequestGet_t,
  TmpFileFD_t,
  tmpFileViaSomeFS,
} from "../src/context/service";
export class TestService implements IResolverServiceLayer {
  public fs: Cache;
  public requestGet: RequestGet_t;
  public tmpFile: TmpFileFD_t;
  constructor() {
    this.fs = new MemFSWrapped();
    this.requestGet = requestGetViaRequest;
    this.tmpFile = tmpFileViaSomeFS(this.fs);
  }
}
