import { FSService, Operation } from './fs';

import { formatDate } from '@angular/common';

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
    super(original);
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
    // @see http://www.linfo.org/touch.html
    const ts = formatDate(this.time, 'yyyyMMddHHmm.ss', 'en_US');
    return `touch -f -t '${ts}' ${basename(this.path)}`;
  }

}
