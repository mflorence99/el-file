import { FSService, Operation, OperationResult } from './fs';

import { pluralize } from 'ellib';

/**
 * Trash files
 */

export class TrashOperation extends Operation {

  /** Make a rename operation */
  static makeInstance(paths: string[],
                      fsSvc: FSService): TrashOperation {
    return new TrashOperation(paths);
  }

  /** ctor */
  constructor(private paths: string[],
                      original = true) {
    super(original);
  }

  /** @override */
  runImpl(fsSvc: FSService): OperationResult {
    return fsSvc.trashFiles(this.paths);
  }

  /** @override */
  toStringImpl(fsSvc: FSService): string {
    const path = this.paths[0];
    const others = pluralize(this.paths.length - 1, {
      '=1': 'one other', 'other': '# others'
    });
    return (this.paths.length === 1)?
      `trash ${path}` :
      `trash ${path} and ${others}`;
  }

}
