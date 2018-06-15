import { FSService } from './fs';
import { Operation } from './fs';
import { OperationResult } from './fs';
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
