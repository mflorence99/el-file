import { FSService, Operation } from './fs';

/**
 * Touch
 */

export class TouchOperation extends Operation {

  /** Make a rename operation */
  static makeInstance(path: string,
                      fsSvc: FSService): TouchOperation {
    const time = new Date();
    const orig = fsSvc.lstat(path).mtime;
    return new TouchOperation(path, time, orig);
  }

  /** ctor */
  constructor(private path: string,
              private time: Date,
                      orig: Date,
                      original = true) {
    super(false);
    if (original)
      this.undo = new TouchOperation(path, orig, time, false);
  }

  /** @override */
  runImpl(fsSvc: FSService): string {
    return fsSvc.touchFile(this.path, this.time);
  }

  /** @override */
  toStringImpl(fsSvc: FSService): string {
    const basename = fsSvc.path.basename;
    return `touch -f -t '${this.time}' ${basename(this.path)}`;
  }

}
