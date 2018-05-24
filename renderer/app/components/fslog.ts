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

}
