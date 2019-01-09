import { FSWrapper, MemFSWrapped } from "./fs";
import request = require("request");
import tmp = require("tmp");
import uuid = require("uuid");

export type TmpFile_t = (cb: (error: any, path: string, fd: number) => void) => void;
export type RequestGet_t = (
  url: string,
  error: (err: Error) => void,
  response: (data: any) => void,
  end: () => void,
) => void;

export interface IResolverServiceLayer {
  // these two won't get their own wrappers because of cross-dependency in resolvers
  requestGet: RequestGet_t;
  tmpFile: TmpFile_t;

  fs: FSWrapper;
}

export function requestGetViaRequest(
  url: string,
  error: (err: Error) => void,
  response: (data: any) => void,
  end: () => void,
): void {
  request.get(url, undefined, (err, resp, body) => {
    if (err) {
      error(err);
      return end();
    }

    if (resp.statusCode && 200 <= resp.statusCode && resp.statusCode < 300) {
      response(body);
    } else {
      error(new Error("Status code " + resp.statusCode));
    }
    return end();
  });
}

export function tmpFileViaSomeFS(fs: FSWrapper): TmpFile_t {
  return (cb: (error: any, path: string, fd: number) => void) => {
    const newFilename = uuid.v4();
    const tmpDir = "/tmp/";
    const newFullPath = `${tmpDir}resolver_${newFilename}`;

    fs.open(newFullPath, "w", 384 /* 0600*/, (errOnOpen, fd) => {
      if (errOnOpen) {
        return cb(errOnOpen, newFullPath, 0);
      }

      return cb(null, newFullPath, fd);
    });
  };
}

export class NodeService implements IResolverServiceLayer {
  public fs: FSWrapper;
  public requestGet: RequestGet_t;

  constructor() {
    tmp.setGracefulCleanup();
    // this.maxBuffSize = 69 * 1024; // 69kB

    this.fs = require("fs");
    this.requestGet = requestGetViaRequest;
  }

  // via 'tmp' package
  // tmpFile(cb: (error: any, path: string, sink: (data: any) => void) => void): void {
  //   tmp.file((err, path, fd) => {
  //     debug("Creating write stream to file %s", path);
  //     const ws = this.fs.createWriteStream("", { autoClose: false, fd: fd });
  //     cb(err, path, (data: any) => {
  //       debug("Writing to stream");
  //       ws.write(data, () => {
  //         debug("Closing stream");
  //         ws.close();
  //       });
  //     });
  //   });
  // }
  tmpFile = tmp.file;
}

export class BrowserService implements IResolverServiceLayer {
  public fs: FSWrapper;
  public tmpFile: TmpFile_t;

  constructor() {
    this.fs = new MemFSWrapped();
    this.tmpFile = tmpFileViaSomeFS(this.fs);
  }

  // via xhr
  requestGet(url: string, error: (err: Error) => void, response: (data: any) => void, end: () => void): void {
    let req = new XMLHttpRequest();
    req.onerror = evt => {
      error(new Error(evt.toString()));
    };
    req.onabort = evt => {
      error(new Error(evt.toString()));
    };

    req.onload = (/* ignore incoming event */) => {
      response(req.responseText);
      end();
    };
    req.open("GET", url);
    req.send();
  }
}
