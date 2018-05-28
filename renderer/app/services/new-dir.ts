import { FSService, Operation, OperationResult } from './fs';

/**
 * New directory
 */

export class NewDirOperation extends Operation {

  /** Make a rename operation */
  static makeInstance(path: string,
                      fsSvc: FSService): NewDirOperation {
    return new NewDirOperation(path);
  }

  /** ctor */
  constructor(private path: string,
                      original = true) {
    super(original);
  }

  /** @override */
  runImpl(fsSvc: FSService): OperationResult {
    return fsSvc.newDir(this.path);
  }

  /** @override */
  toStringImpl(fsSvc: FSService): string {
    return `mkdir ${this.path}`;
  }

}
