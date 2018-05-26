import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { FSLogStateModel } from '../state/fslog';
import { FSService } from '../services/fs';
import { PrefsStateModel } from '../state/prefs';

/**
 * Log component
 */

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'elfile-log',
  templateUrl: 'log.html',
  styleUrls: ['log.scss']
})

export class LogComponent {

  @Input() fslog = { } as FSLogStateModel;
  @Input() prefs = { } as PrefsStateModel;

  logType = 'fs';

  /** ctor */
  constructor(public fsSvc: FSService) { }

}
