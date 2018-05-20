import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { FSStateModel } from '../state/fs';
import { LayoutStateModel } from '../state/layout';
import { PrefsStateModel } from '../state/prefs';
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

  @Input() fs: FSStateModel;
  @Input() layout: LayoutStateModel;
  @Input() prefs: PrefsStateModel;
  @Input() views: ViewsStateModel;

  private updateSplitSizes: Function;

  /** ctor */
  constructor(private store: Store) {
    this.updateSplitSizes = debounce((id: string, sizes: number[]) => {
      this.store.dispatch(new UpdateSplitSizes({id, sizes}));
    }, 500);
  }

  // event handlers

  onSplitSizeChange(event: {gutterNum: number,
                            sizes: number[]}): void {
    this.updateSplitSizes(this.layout.id, event.sizes);
  }

}
