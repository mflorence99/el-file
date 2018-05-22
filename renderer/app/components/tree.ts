import { Actions, Store, ofAction } from '@ngxs/store';
import { ChangeDetectionStrategy, Component, Input, OnInit, ViewChild } from '@angular/core';
import { Descriptor, Dictionary, DictionaryService } from '../services/dictionary';
import { DirLoaded, FSStateModel } from '../state/fs';

import { ContextMenuComponent } from 'ngx-contextmenu';
import { LifecycleComponent } from 'ellib';
import { NewTab } from '../state/layout';
import { OnChange } from 'ellib';
import { PrefsStateModel } from '../state/prefs';
import { RootPageComponent } from '../pages/root/page';
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

export class TreeComponent extends LifecycleComponent
                           implements OnInit {

  @Input() fs: FSStateModel;
  @Input() prefs: PrefsStateModel;
  @Input() splitID: string;
  @Input() tab: Tab;
  @Input() view: View;

  @ViewChild(ContextMenuComponent) contextMenu: ContextMenuComponent;

  descriptors: Descriptor[] = [];
  dictionary: Dictionary[] = [];

  /** ctor */
  constructor(private actions$: Actions,
              private dictSvc: DictionaryService,
              private root: RootPageComponent,
              private store: Store) {
    super();
  }

  /** Is context menu bound to a directory? */
  isDirectory(desc: Descriptor): boolean {
    return desc.isDirectory;
  }

  // lifecycle methods

  ngOnInit() {
    this.actions$
      .pipe(ofAction(DirLoaded))
      .subscribe(() => {
        this.onChange(/*fsChanged=*/true, false, false, false);
      });
  }

  // event handlers

  onContextMenu(event: {event?: MouseEvent,
                        item: Descriptor},
                command: string) {
    const desc = event.item;
    switch (command) {
      case 'open':
        this.store.dispatch(new NewTab({ splitID: this.splitID, path: desc.path }));
        break;
      case 'properties':
        this.root.onEditProps(desc);
        break;
    }
  }

  // bind OnChange handlers

  @OnChange('fs', 'prefs', 'tab', 'view')
  onChange(fsChanged: boolean,
           prefsChanged: boolean,
           tabChanged: boolean,
           viewChanged: boolean) {
    if ((this.fs && this.prefs && this.tab)
     && (fsChanged || prefsChanged || tabChanged)) {
      // TODO: temporary
      const path = this.tab.paths[0];
      if (this.fs[path])
        this.descriptors = this.dictSvc.makeDescriptors(path, this.fs, this.prefs);
    }
    if (this.view && viewChanged)
      this.dictionary = this.dictSvc.dictionaryForView(this.view);
    this.sort();
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
