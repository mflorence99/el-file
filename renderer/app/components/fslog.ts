import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { FSLogStateModel } from '../state/fslog';
import { PrefsStateModel } from '../state/prefs';

/**
 * FS log component
 */

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'elfile-fslog',
  templateUrl: 'fslog.html',
  styleUrls: ['fslog.scss']
})

export class FSLogComponent {

  @Input() fslog = { } as FSLogStateModel;
  @Input() prefs = { } as PrefsStateModel;

  /** Are all the log entries in one 24 hour period? */
  allInOneDay(): boolean {
    if ((this.prefs.dateFormat === 'ago')
     || (this.fslog.entries && (this.fslog.entries.length > 0))) {
      const first = this.fslog.entries[0].ts;
      const last = this.fslog.entries[this.fslog.entries.length - 1].ts;
      const period = last.getTime() - first.getTime();
      return period < (24 * 60 * 60 * 1000);
    }
    else return false;
  }

}
