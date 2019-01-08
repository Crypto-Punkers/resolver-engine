import { PathLike, Stats, WriteStream } from "fs";
import { fs as memfs } from "memfs";
import { IError, IReadFileOptions, TCallback } from "memfs/lib/volume";

// TODO
// idk if I should forcefully try to marry the two interfaces (fs and memfs') together

// declaring only those methods that were necessary
// using Node's fs interface as a model
export interface FSWrapper {
  writeFile(path: PathLike | number, data: any, callback: (err: NodeJS.ErrnoException | undefined) => void): void;
  readFile(
    path: PathLike | number,
    options: { encoding: string; flag?: string } | string,
    callback: (err: NodeJS.ErrnoException | undefined, data: string | Buffer) => void,
  ): void;
  createWriteStream(
    path: PathLike,
    options?:
      | string
      | {
          flags?: string;
          encoding?: string;
          fd?: number;
          mode?: number;
          autoClose?: boolean;
          start?: number;
        },
  ): WriteStream;
  stat(path: PathLike, callback: (err: NodeJS.ErrnoException | undefined, stats: Stats) => void): void;
}

// I'm getting weird errors, so I will superimpose some extra type safety and error handling on memfs
export class MemFSWrapped implements FSWrapper {
  private fs: typeof memfs;
  constructor() {
    this.fs = memfs;
  }

  writeFile(
    path: string | number | Buffer | import("url").URL,
    data: any,
    callback: (err: NodeJS.ErrnoException | undefined) => void,
  ): void {
    return this.fs.writeFile(path, data, callback);
  }
  readFile(
    path: string | number | Buffer | import("url").URL,
    options: string | { encoding: string; flag?: string | undefined },
    callback: (err: NodeJS.ErrnoException | undefined, data: string | Buffer) => void,
  ): void {
    let optionsRepackaged: string | IReadFileOptions =
      typeof options === "string"
        ? options
        : {
            encoding: options.encoding as IReadFileOptions["encoding"],
            flag: options.flag,
          };
    let callbackRepackaged: TCallback<string | Buffer> = (err, data) => {
      if (typeof data === "undefined") {
        if (!err) {
          // split to keep compiler happy
          // only case not handled by the original callback: no error, undefined data
          // => still call out an error
          return callback(new Error("undefined data"), "");
        } else {
          return callback(err, "");
        }
      } else {
        return callback(err, data);
      }
    };
    // I will be using a shorthand for this from now on

    return this.fs.readFile(path, optionsRepackaged, callbackRepackaged);
  }
  createWriteStream(
    path: PathLike,
    options?:
      | string
      | {
          flags?: string | undefined;
          encoding?: string | undefined;
          fd?: number | undefined;
          mode?: number | undefined;
          autoClose?: boolean | undefined;
          start?: number | undefined;
        }
      | undefined,
  ): WriteStream {
    return this.fs.createWriteStream(path, options);
  }
  stat(path: PathLike, callback: (err: NodeJS.ErrnoException | undefined, stats: Stats) => void): void {
    // shorthand for
    let callbackRepackaged = callbackRepackagedShorthand(callback);
    return this.fs.stat(path, callbackRepackaged);
  }
}

/**
 * Check readFile method on MemFSWrapped
 * @param callback NodeJS-style callback
 * @returns memfs-style callback
 */
function callbackRepackagedShorthand<T>(callback: (err: NodeJS.ErrnoException | undefined, data: T) => void) {
  return (err?: IError, data?: T) => {
    return typeof data === "undefined"
      ? !err
        ? callback(new Error("undefined data"), {} as T)
        : callback(err, {} as T)
      : callback(err, data);
  };
}

// test a la Golang
(async () => {
  let b1: FSWrapper = await import("fs");
  let b2: FSWrapper = new MemFSWrapped();
  ((b1, b2) => b1 || b2)(b1, b2); // to keep TS compiler happy
})();
