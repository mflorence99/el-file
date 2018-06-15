import { ChangeDetectionStrategy } from '@angular/core';
import { Component } from '@angular/core';
import { Dictionary } from '../services/dictionary';
import { Input } from '@angular/core';
import { Store } from '@ngxs/store';
import { UpdateViewSort } from '../state/views';
import { View } from '../state/views';

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

  onSortChange(sortColumn: string): void {
    let sortDir = 1;
    if (this.view.sortColumn === sortColumn)
      sortDir = this.view.sortDir * -1;
    this.store.dispatch(new UpdateViewSort({ viewID: this.viewID, sortColumn, sortDir}));
  }

}
