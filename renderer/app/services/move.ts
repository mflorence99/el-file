import { FSService, Operation, OperationResult } from './fs';

import { pluralize } from 'ellib';

/**
 * Move
 */

export class MoveOperation extends Operation {

  /** Make a rename operation */
  static makeInstance(froms: string[],
                      to: string,
                      fsSvc: FSService): MoveOperation {
    const stat = fsSvc.lstat(to);
    const tos = froms.map(from => {
      const base = fsSvc.basename(from);
      return fsSvc.join(stat.isDirectory()? to : fsSvc.dirname(to), base);
    });
    return new MoveOperation(froms, tos);
  }

  /** ctor */
  constructor(private froms: string[],
              private tos: string[],
                      original = true) {
    super(original);
    if (original)
      this.undo = new MoveOperation(tos, froms, false);
  }

  /** @override */
  runImpl(fsSvc: FSService): OperationResult {
    const result = fsSvc.move(this.froms, this.tos);
    // we may have had to change the names of the destinations
    if (this.undo)
      (<MoveOperation>this.undo).froms = result.partial;
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
      `mv ${from} ${to}` :
      `mv ${from} ${to} and ${others}`;
  }

}
