import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { Dictionary } from '../services/dictionary';

/**
 * Column component
 */

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'elfile-column',
  templateUrl: 'column.html',
  styleUrls: ['column.scss']
})

export class ColumnComponent {

  @Input() entry: Dictionary;

}
