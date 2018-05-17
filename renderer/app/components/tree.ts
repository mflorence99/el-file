import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Descriptor, DictionaryService } from '../services/dictionary';

import { FSStateModel } from '../state/fs';
import { LifecycleComponent } from 'ellib';
import { OnChange } from 'ellib';
import { Tab } from '../state/layout';
import { View } from '../state/views';

/**
 * Tree component
 */

@Component({
  changeDetection: ChangeDetectionStrategy.Default,
  selector: 'elfile-tree',
  templateUrl: 'tree.html',
  styleUrls: ['tree.scss']
})

export class TreeComponent extends LifecycleComponent  {

  @Input() fs: FSStateModel;
  @Input() tab: Tab;
  @Input() view: View;

  descriptors: Descriptor[] = [];

  /** ctor */
  constructor(private dict: DictionaryService) {
    super();
  }

  // OnChange handlers

  @OnChange('fs') xxx() {
    if (this.fs) {
      Object.keys(this.fs).forEach(path => {
        this.descriptors = this.dict.makeDescriptors(this.fs[path]);
      });
    }
  }

}
