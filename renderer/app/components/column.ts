import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { UpdateViewSort, View } from '../state/views';

import { Dictionary } from '../services/dictionary';
import { Store } from '@ngxs/store';

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

  @Input() entry = { } as Dictionary;
  @Input() view = { } as View;
  @Input() viewID: string;

  /** ctor */
  constructor(private store: Store) { }

  // event handlers

  onSortChange(sortColumn: string) {
    let sortDir = 1;
    if (this.view.sortColumn === sortColumn)
      sortDir = this.view.sortDir * -1;
    this.store.dispatch(new UpdateViewSort({ viewID: this.viewID, sortColumn, sortDir}));
  }

}
