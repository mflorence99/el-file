import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Descriptor, Dictionary } from '../services/dictionary';

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

  @Input() desc: Descriptor;
  @Input() entry: Dictionary;
  @Input() prefs: PrefsStateModel;

}
