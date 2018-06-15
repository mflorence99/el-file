import { ChangeDetectionStrategy } from '@angular/core';
import { ClipboardStateModel } from '../state/clipboard';
import { Component } from '@angular/core';
import { FSLogStateModel } from '../state/fslog';
import { FSService } from '../services/fs';
import { Input } from '@angular/core';
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

  @Input() clipboard = { } as ClipboardStateModel;
  @Input() fslog = { } as FSLogStateModel;
  @Input() prefs = { } as PrefsStateModel;

  logType = 'fs';

  /** ctor */
  constructor(public fsSvc: FSService) { }

}
