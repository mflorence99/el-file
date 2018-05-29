import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { ClipboardStateModel } from '../state/clipboard';
import { Descriptor } from '../state/fs';
import { Dictionary } from '../services/dictionary';
import { PrefsStateModel } from '../state/prefs';
import { TreeComponent } from './tree';

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

  @Input() clipboard = { } as ClipboardStateModel;
  @Input() desc = { } as Descriptor;
  @Input() entry = { } as Dictionary;
  @Input() prefs = { } as PrefsStateModel;

  /** ctor */
  constructor(public tree: TreeComponent) { }

}
