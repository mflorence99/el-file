import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Dictionary, DictionaryService } from '../services/dictionary';
import { UpdateViewWidths, View, ViewWidths } from '../state/views';

import { LifecycleComponent } from 'ellib';
import { OnChange } from 'ellib';
import { Store } from '@ngxs/store';

/**
 * Header component
 */

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'elfile-header',
  templateUrl: 'header.html',
  styleUrls: ['header.scss']
})

export class HeaderComponent extends LifecycleComponent {

  @Input() view = { } as View;
  @Input() viewID: string;

  dictionary: Dictionary[] = [];

  /** ctor */
  constructor(private dictSvc: DictionaryService,
              private store: Store) {
    super();
  }

  // event handlers

  onSplitSizeChange(event: {gutterNum: number,
                            sizes: number[]}): void {
    const widths = this.dictionary.reduce((acc, entry, ix) => {
      acc[entry.name] = event.sizes[ix];
      return acc;
    }, { } as ViewWidths);
    this.store.dispatch(new UpdateViewWidths({ viewID: this.viewID, widths }));
  }

  // bind OnChange handlers

  @OnChange('view') onView() {
    if (this.view)
      this.dictionary = this.dictSvc.dictionaryForView(this.view);
  }

}
