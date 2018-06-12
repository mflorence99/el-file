import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Dictionary, DictionaryService } from '../services/dictionary';
import { LifecycleComponent, OnChange } from 'ellib';
import { UpdateViewWidths, View, ViewWidths } from '../state/views';

import { PrefsStateModel } from '../state/prefs';
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

  @Input() prefs = { } as PrefsStateModel;
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
    // NOTE: sanity check -- we've seen fewer split sizes that there are splits
    // @see https://github.com/mflorence99/el-file/issues/6
    if (event.sizes.length === this.dictionary.length) {
      const widths = this.dictionary.reduce((acc, entry, ix) => {
        acc[entry.name] = event.sizes[ix];
        return acc;
      }, { } as ViewWidths);
      this.store.dispatch(new UpdateViewWidths({ viewID: this.viewID, widths }));
    }
  }

  // bind OnChange handlers

  @OnChange('view') onView(): void {
    if (this.view)
      this.dictionary = this.dictSvc.dictionaryForView(this.view);
  }

}
