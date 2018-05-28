import { FSService, Operation, OperationResult } from './fs';

/**
 * New file
 */

export class NewFileOperation extends Operation {

  /** Make a rename operation */
  static makeInstance(path: string,
                      fsSvc: FSService): NewFileOperation {
    return new NewFileOperation(path);
  }

  /** ctor */
  constructor(private path: string,
                      original = true) {
    super(original);
  }

  /** @override */
  runImpl(fsSvc: FSService): OperationResult {
    return fsSvc.newFile(this.path);
  }

  /** @override */
  toStringImpl(fsSvc: FSService): string {
    return `touch ${this.path}`; 
  }

}
