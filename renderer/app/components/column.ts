import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { View } from '../state/views';

/**
 * Column component
 */

@Component({
  changeDetection: ChangeDetectionStrategy.Default,
  selector: 'elfile-column',
  templateUrl: 'column.html',
  styleUrls: ['column.scss']
})

export class ColumnComponent {

  @Input() view: View;

}
