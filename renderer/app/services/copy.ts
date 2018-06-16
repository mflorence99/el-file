import { DeleteOperation } from './delete';
import { FSService } from './fs';
import { Operation } from './fs';
import { OperationResult } from './fs';

import { pluralize } from 'ellib';

/**
 * Copy
 */

export class CopyOperation extends Operation {

  /** Make a rename operation */
  static makeInstance(froms: string[],
                      to: string,
                      fsSvc: FSService): CopyOperation {
    const stat = fsSvc.lstat(to);
    to = stat.isDirectory()? to : fsSvc.dirname(to);
    if (fsSvc.isWritable(to)) {
      const tos = froms.map(from => {
        const base = fsSvc.basename(from);
        return fsSvc.join(to, base);
      });
      return new CopyOperation(froms, tos);
    }
    else return null;
  }

  /** ctor */
  constructor(private froms: string[],
              private tos: string[],
                      original = true) {
    super(original);
    if (original)
      this.undo = new DeleteOperation(tos, false);
  }

  /** @override */
  runImpl(fsSvc: FSService): OperationResult {
    const result = fsSvc.copy(this.froms, this.tos);
    // we may have had to change the names of the destinations
    if (this.undo)
      (<DeleteOperation>this.undo).paths = result.partial;
    return null;
  }

  /** @override */
  toStringImpl(fsSvc: FSService): string {
    const from = this.froms[0];
    const to = this.tos[0];
    const others = pluralize(this.froms.length - 1, {
      '=1': 'one other', 'other': '# others'
    });
    return (this.froms.length === 1)?
      `cp -r ${from} ${to}` :
      `cp -r ${from} ${to} and ${others}`;
  }

}
