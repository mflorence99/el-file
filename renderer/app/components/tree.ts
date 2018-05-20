import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Descriptor, Dictionary, DictionaryService } from '../services/dictionary';

import { FSStateModel } from '../state/fs';
import { LifecycleComponent } from 'ellib';
import { OnChange } from 'ellib';
import { PrefsStateModel } from '../state/prefs';
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
      this.sort();
    }
  }

  @OnChange('prefs') onPrefs() {
    if (this.prefs)
      this.sort();
  }

  @OnChange('view') onView() {
    if (this.view) {
      this.dictionary = this.dict.dictionaryForView(this.view);
      this.sort();
    }
  }

  // private methods

  private sort(): void {
    if (['first', 'last'].includes(this.prefs.sortDirectories)) {
      const directories = this.descriptors.filter(desc => desc.isDirectory);
      const files = this.descriptors.filter(desc => !desc.isDirectory);
      if (this.prefs.sortDirectories === 'first')
        this.descriptors = this.sortImpl(directories).concat(this.sortImpl(files));
      else if (this.prefs.sortDirectories === 'last')
        this.descriptors = this.sortImpl(files).concat(this.sortImpl(directories));
    }
    else this.sortImpl(this.descriptors);
  }

  private sortImpl(descriptors: Descriptor[]): Descriptor[] {
    const entry = this.dictionary.find(dict => dict.name === this.view.sortColumn);
    const col = this.view.sortColumn;
    const dir = this.view.sortDir;
    return descriptors.sort((a, b) => {
      if (entry.isDate)
        return (a[col].getTime() - b[col].getTime()) * dir;
      else if (entry.isQuantity)
        return (a[col] - b[col]) * dir;
      else if (entry.isString)
        return a[col].toLowerCase().localeCompare(b[col].toLowerCase()) * dir;
      else return 0;
    });
  }

}
