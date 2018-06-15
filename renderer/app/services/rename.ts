import { FSService } from './fs';
import { Operation } from './fs';
import { OperationResult } from './fs';

/**
 * Rename
 */

export class RenameOperation extends Operation {

  /** Make a rename operation */
  static makeInstance(path: string,
                      name: string,
                      fsSvc: FSService): RenameOperation {
    const from = path;
    const base = fsSvc.dirname(path);
    const to = fsSvc.join(base, name);
    return (from !== to)? new RenameOperation(from, to) : null;
  }

  /** ctor */
  constructor(private from: string,
              private to: string,
                      original = true) {
    super(original);
    if (original)
      this.undo = new RenameOperation(to, from, false);
  }

  /** @override */
  runImpl(fsSvc: FSService): OperationResult {
    return fsSvc.rename(this.from, this.to);
  }

  /** @override */
  toStringImpl(fsSvc: FSService): string {
    return `mv ${this.from} ${this.to}`;
  }

}
