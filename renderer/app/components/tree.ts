import { Actions, Store, ofAction } from '@ngxs/store';
import { AutoUnsubscribe, LifecycleComponent } from 'ellib';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit, ViewChild } from '@angular/core';
import { Dictionary, DictionaryService } from '../services/dictionary';
import { DirLoaded, FSStateModel } from '../state/fs';
import { NewTab, Tab, TabUpdated, TabsUpdated } from '../state/layout';
import { PrefsStateModel, PrefsUpdated } from '../state/prefs';
import { View, ViewUpdated } from '../state/views';
import { debounceTime, filter } from 'rxjs/operators';

import { ContextMenuComponent } from 'ngx-contextmenu';
import { Descriptor } from '../state/fs';
import { FSService } from '../services/fs';
import { RenameOperation } from '../services/rename';
import { RootPageComponent } from '../pages/root/page';
import { SelectionStateModel } from '../state/selection';
import { Subscription } from 'rxjs';
import { TouchOperation } from '../services/touch';

/**
 * Tree component
 */

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'elfile-tree',
  templateUrl: 'tree.html',
  styleUrls: ['tree.scss']
})

@AutoUnsubscribe()
export class TreeComponent extends LifecycleComponent
                           implements OnInit {

  @Input() fs = { } as FSStateModel;
  @Input() prefs = { } as PrefsStateModel;
  @Input() selection = { } as SelectionStateModel;
  @Input() splitID: string;
  @Input() tab = { } as Tab;
  @Input() view = { } as View;

  @ViewChild(ContextMenuComponent) contextMenu: ContextMenuComponent;

  descriptorsByPath: { [path: string]: Descriptor[] } = { };
  dictionary: Dictionary[] = [];

  loaded: boolean;
  newName: string;

  subToActions: Subscription;

  /** ctor */
  constructor(private actions$: Actions,
              private cdf: ChangeDetectorRef,
              private dictSvc: DictionaryService,
              private fsSvc: FSService,
              private root: RootPageComponent,
              private store: Store) {
    super();
  }

  /** Is new name allowed? */
  canNewName(): boolean {
    return this.newName && (this.newName.length > 0);
  }

  /** Is context menu bound to a directory? */
  isDirectory(desc: Descriptor): boolean {
    return desc.isDirectory;
  }

  /** Is context menu bound to a file? */
  isFile(desc: Descriptor): boolean {
    return desc.isFile;
  }

  /** Is context menu bound to a writable directory? */
  isWritableDirectory(desc: Descriptor): boolean {
    return desc.isDirectory && desc.isWritable;
  }

  /** Is context menu bound to a writable directory? */
  isWritableFile(desc: Descriptor): boolean {
    return desc.isFile && desc.isWritable;
  }

  /** Prepare for a new name */
  prepareNewName(initial: string,
                 ctrl: HTMLInputElement): string {
    if (!ctrl.getAttribute('_init')) {
      ctrl.setAttribute('_init', 'true');
      setTimeout(() => {
        ctrl.value = this.newName = initial;
        const ix = initial.lastIndexOf('.');
        if (ix === -1)
          ctrl.select();
        else ctrl.setSelectionRange(0, ix);
        console.log(`CTRL=${ctrl.value} NEW NAME=${this.newName}`);
        ctrl.focus();
      }, 100);
    }
    return this.newName;
  }

  // event handlers

  onExecute(event: {event?: MouseEvent,
                    item: Descriptor},
            command: string): void {
    const desc = event.item;
    // execute command
    switch (command) {
      // these commands are singular
      case 'open':
        this.store.dispatch(new NewTab({ splitID: this.splitID, path: desc.path }));
        break;
      case 'properties':
        this.root.onEditProps(desc);
        break;
      case 'rename':
        const renameOp = RenameOperation.makeInstance(desc.path, this.newName, this.fsSvc);
        this.fsSvc.run(renameOp);
        break;
      // these commands affect the entire selection
      case 'touch':
        const touchOp = TouchOperation.makeInstance(this.selection.paths, this.fsSvc);
        this.fsSvc.run(touchOp);
        break;
    }
  }

  onNewName(name: string): void {
    this.newName = name;
    console.log(`NEW NAME=${this.newName}`);
  }

  // lifecycle methods

  ngOnInit(): void {
    this.subToActions = this.actions$
      .pipe(
        ofAction(DirLoaded, PrefsUpdated, TabsUpdated, TabUpdated, ViewUpdated),
        filter(action => {
          switch (action.constructor) {
            case DirLoaded:
              return this.tab.paths.includes((<DirLoaded>action).payload.path);
            case PrefsUpdated:
              return true;
            case TabsUpdated:
              return (<TabsUpdated>action).payload.splitID === this.splitID;
            case TabUpdated:
              return (<TabUpdated>action).payload.tab.id === this.tab.id;
            case ViewUpdated:
              return (<ViewUpdated>action).payload.viewID === this.tab.id;
          }
        }),
        debounceTime(100),
      ).subscribe(() => {
        this.dictionary = this.dictSvc.dictionaryForView(this.view);
        this.tab.paths.forEach(path => {
          this.descriptorsByPath[path] =
            this.dictSvc.descriptorsForView(path, this.fs, this.dictionary, this.prefs, this.view);
        });
        this.loaded = true;
        this.cdf.detectChanges();
      });
  }

}
