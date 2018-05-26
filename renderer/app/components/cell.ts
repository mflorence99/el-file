import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { BranchComponent } from './branch';
import { Descriptor } from '../state/fs';
import { Dictionary } from '../services/dictionary';
import { PrefsStateModel } from '../state/prefs';

/**
 * Cell component
 */

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'elfile-cell',
  templateUrl: 'cell.html',
  styleUrls: ['cell.scss']
})

export class CellComponent {

  @Input() desc = { } as Descriptor;
  @Input() entry = { } as Dictionary;
  @Input() prefs = { } as PrefsStateModel;

  /** ctor */
  constructor(public branch: BranchComponent) { }

}
