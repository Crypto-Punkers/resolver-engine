import { PathLike, WriteStream, Stats } from "fs";

// MORE YET TO COME
export interface FSWrapper {
	createWriteStream(path: PathLike, options?: string | {
		flags?: string;
		encoding?: string;
		fd?: number;
		mode?: number;
		autoClose?: boolean;
		start?: number;
	}): WriteStream;
	stat(path: PathLike, callback: (err: NodeJS.ErrnoException | undefined, stats: Stats | undefined) => void): void; // these two 'undefined' make things compatible

}

