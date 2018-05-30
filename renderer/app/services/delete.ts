import { FSService, Operation, OperationResult } from './fs';

import { pluralize } from 'ellib';

/**
 * Delete -- used as 'undo' for copy
 */

export class DeleteOperation extends Operation {

  /** Make a rename operation */
  static makeInstance(paths: string[],
                      fsSvc: FSService): DeleteOperation {
    return new DeleteOperation(paths);
  }

  /** ctor */
  constructor(public paths: string[],
                     original = true) {
    super(original);
  }

  /** @override */
  runImpl(fsSvc: FSService): OperationResult {
    fsSvc.remove(this.paths);
    // NOTE: we fail silently because we only use it for undo
    // also we may delete a directory before we try to delete files inside it
    return null;
  }

  /** @override */
  toStringImpl(fsSvc: FSService): string {
    const path = this.paths[0];
    const others = pluralize(this.paths.length - 1, {
      '=1': 'one other', 'other': '# others'
    });
    return (this.paths.length === 1)?
      `rm -rf ${path}` :
      `rm -rf ${path} and ${others}`;
  }

}
