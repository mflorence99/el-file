import { ChangeDetectionStrategy } from '@angular/core';
import { ClipboardStateModel } from '../state/clipboard';
import { Component } from '@angular/core';
import { FSStateModel } from '../state/fs';
import { Input } from '@angular/core';
import { LayoutStateModel } from '../state/layout';
import { PrefsStateModel } from '../state/prefs';
import { SelectionStateModel } from '../state/selection';
import { Store } from '@ngxs/store';
import { UpdateSplitSizes } from '../state/layout';
import { ViewsStateModel } from '../state/views';

import { debounce } from 'ellib';

/**
 * Splittable component
 */

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'elfile-splittable',
  templateUrl: 'splittable.html',
  styleUrls: ['splittable.scss']
})

export class SplittableComponent {

  @Input() clipboard = { } as ClipboardStateModel;
  @Input() fs = { } as FSStateModel;
  @Input() isOpRunning: boolean;
  @Input() layout = { } as LayoutStateModel;
  @Input() prefs = { } as PrefsStateModel;
  @Input() selection = { } as SelectionStateModel;
  @Input() views = { } as ViewsStateModel;

  private updateSplitSizes: Function;

  /** ctor */
  constructor(private store: Store) {
    this.updateSplitSizes = debounce((splitID: string, sizes: number[]) => {
      this.store.dispatch(new UpdateSplitSizes({ splitID, sizes }));
    }, 500);
  }

  // event handlers

  onSplitSizeChange(event: {gutterNum: number,
                            sizes: number[]}): void {
    this.updateSplitSizes(this.layout.id, event.sizes);
  }

}
