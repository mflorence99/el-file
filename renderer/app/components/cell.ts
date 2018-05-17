import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { View } from '../state/views';

/**
 * Cell component
 */

@Component({
  changeDetection: ChangeDetectionStrategy.Default,
  selector: 'elfile-cell',
  templateUrl: 'cell.html',
  styleUrls: ['cell.scss']
})

export class CellComponent {

  @Input() view: View;

}
