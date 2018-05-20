import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Descriptor, Dictionary, DictionaryService } from '../services/dictionary';

import { FSStateModel } from '../state/fs';
import { LifecycleComponent } from 'ellib';
import { OnChange } from 'ellib';
import { PrefsStateModel } from '../state/prefs';
import { Tab } from '../state/layout';
import { View } from '../state/views';

/**
 * Tree component
 */

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'elfile-tree',
  templateUrl: 'tree.html',
  styleUrls: ['tree.scss']
})

export class TreeComponent extends LifecycleComponent  {

  @Input() fs: FSStateModel;
  @Input() prefs: PrefsStateModel;
  @Input() tab: Tab;
  @Input() view: View;

  descriptors: Descriptor[] = [];
  dictionary: Dictionary[] = [];

  /** ctor */
  constructor(private dict: DictionaryService) {
    super();
  }

  // bind OnChange handlers

  @OnChange('fs') onFS() {
    if (this.fs) {
      Object.keys(this.fs).forEach(path => {
        this.descriptors = this.dict.makeDescriptors(this.fs[path]);
      });
    }
  }

  @OnChange('view') onView() {
    if (this.view)
      this.dictionary = this.dict.dictionaryForView(this.view);
  }

}
