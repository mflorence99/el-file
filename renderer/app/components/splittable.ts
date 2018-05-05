import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { LayoutStateModel } from '../state/layout';
import { Store } from '@ngxs/store';
import { UpdateSplitSizes } from '../state/layout';
import { debounce } from 'ellib';

/**
 * Splittable component
 */

@Component({
  changeDetection: ChangeDetectionStrategy.Default,
  selector: 'elfile-splittable',
  templateUrl: 'splittable.html',
  styleUrls: ['splittable.scss']
})

export class SplittableComponent {

  @Input() layout: LayoutStateModel;

  private updateSplitSizes: Function;

  /** ctor */
  constructor(private store: Store) {
    this.updateSplitSizes = debounce((id: string, sizes: number[]) => {
      this.store.dispatch(new UpdateSplitSizes({id, sizes}));
    }, 500);
  }

  /** Whenever the split size changes */
  onSplitSizeChange(event: {gutterNum: number,
                            sizes: number[]}): void {
    this.updateSplitSizes(this.layout.id, event.sizes);
  }

}
