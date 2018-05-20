import { ChangeDetectionStrategy, Component, Input, ViewChild } from '@angular/core';
import { Descriptor, Dictionary, DictionaryService } from '../services/dictionary';

import { ContextMenuComponent } from 'ngx-contextmenu';
import { FSStateModel } from '../state/fs';
import { LifecycleComponent } from 'ellib';
import { OnChange } from 'ellib';
import { PrefsStateModel } from '../state/prefs';
import { RootPageComponent } from '../pages/root/page';
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

  @ViewChild(ContextMenuComponent) contextMenu: ContextMenuComponent;

  descriptors: Descriptor[] = [];
  dictionary: Dictionary[] = [];

  /** ctor */
  constructor(private dict: DictionaryService,
              private root: RootPageComponent) {
    super();
  }

  // event handlers

  onContextMenu(event: {event?: MouseEvent,
                        item: Descriptor},
                command: string) {
    console.log('COMMAND==>', command, event.item);
    switch (command) {
      case 'properties':
        this.root.onEditProps(event.item);
        break;
    }
  }

  // bind OnChange handlers

  @OnChange('fs') onFS() {
    if (this.fs) {
      Object.keys(this.fs).forEach(path => {
        this.descriptors = this.dict.makeDescriptors(path, this.fs);
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
