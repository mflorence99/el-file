import { FSService, Operation, OperationResult } from './fs';
import { formatDate, pluralize } from 'ellib';

/**
 * Touch
 */

export class TouchOperation extends Operation {

  /** Make a rename operation */
  static makeInstance(paths: string[],
                      fsSvc: FSService): TouchOperation {
    const origs = fsSvc.lstats(paths).map(stat => stat.mtime);
    const times = origs.map(orig => new Date());
    return new TouchOperation(paths, times, origs);
  }

  /** ctor */
  constructor(private paths: string[],
              private times: Date[],
                      origs: Date[],
                      original = true) {
    super(original);
    if (original)
      this.undo = new TouchOperation(paths, origs, times, false);
  }

  /** @override */
  runImpl(fsSvc: FSService): OperationResult {
    const result = fsSvc.touchPaths(this.paths, this.times);
    if (result && result.partial && this.undo) {
      (<TouchOperation>this.undo).paths = result.partial;
      (<TouchOperation>this.undo).times.length = result.partial.length;
    }
    return result;
  }

  /** @override */
  toStringImpl(fsSvc: FSService): string {
    // @see http://www.linfo.org/touch.html
    const path = this.paths[0];
    const time = this.times[0];
    const ts = formatDate(time, 'yyyyMMddHHmm.ss');
    const others = pluralize(this.paths.length - 1, {
      '=1': 'one other', 'other': '# others'
    });
    return (this.paths.length === 1)?
      `touch -f -t '${ts}' ${path}` :
      `touch -f -t '${ts}' ${path} and ${others}`;
  }

}
