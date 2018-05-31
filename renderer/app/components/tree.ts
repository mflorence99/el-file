import { Actions, Store, ofAction } from '@ngxs/store';
import { AddPathToTab, NewTab, ReplacePathsInTab, Tab, TabUpdated, TabsUpdated, UpdateTab } from '../state/layout';
import { AutoUnsubscribe, LifecycleComponent } from 'ellib';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit, ViewChild } from '@angular/core';
import { ClearClipboard, ClipboardStateModel, CopyToClipboard, CutToClipboard } from '../state/clipboard';
import { Dictionary, DictionaryService } from '../services/dictionary';
import { DirLoaded, DirUnloaded, FSStateModel } from '../state/fs';
import { PrefsStateModel, PrefsUpdated } from '../state/prefs';
import { View, ViewUpdated } from '../state/views';
import { debounceTime, filter } from 'rxjs/operators';

import { ContextMenuComponent } from 'ngx-contextmenu';
import { CopyOperation } from '../services/copy';
import { Descriptor } from '../state/fs';
import { FSService } from '../services/fs';
import { MoveOperation } from '../services/move';
import { NewDirOperation } from '../services/new-dir';
import { NewFileOperation } from '../services/new-file';
import { Progress } from '../state/status';
import { RenameOperation } from '../services/rename';
import { RootPageComponent } from '../pages/root/page';
import { SelectionStateModel } from '../state/selection';
import { Subscription } from 'rxjs';
import { TouchOperation } from '../services/touch';
import { TrashOperation } from '../services/trash';

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

  @Input() clipboard = { } as ClipboardStateModel;
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

  /** Is there anything on the clipboard? */
  isClipboardPopulated(): boolean {
    return this.clipboard.paths.length > 0;
  }

  /** Is this path on the clipboard? */
  isClipped(desc: Descriptor): boolean {
    return desc
        && this.clipboard.paths.includes(desc.path);
  }

  /** Is this path on the clipboard? */
  isCut(desc: Descriptor): boolean {
    return this.isClipped(desc)
        && (this.clipboard.op === 'cut');
  }

  /** Is this some kind of descriptor? */
  isDescriptor(desc: Descriptor): boolean {
    return !!desc;
  }

  /** Is context menu bound to a directory? */
  isDirectory(desc: Descriptor): boolean {
    return desc && desc.isDirectory;
  }

  /** Is this path empty? */
  isEmpty(desc: Descriptor): boolean {
    return desc
        && desc.isDirectory
        && !!this.fs[desc.path]
        && (this.fs[desc.path].length === 0);
  }

  /** Is this path expanded? */
  isExpanded(desc: Descriptor): boolean {
    return desc
        && desc.isDirectory
        && this.tab.paths.includes(desc.path)
        && !!this.fs[desc.path];
  }

  /** Is this path expanding? */
  isExpanding(desc: Descriptor): boolean {
    return desc
        && desc.isDirectory
        && this.tab.paths.includes(desc.path)
        && !this.fs[desc.path];
  }

  /** Is context menu bound to a file? */
  isFile(desc: Descriptor): boolean {
    return desc && desc.isFile;
  }

  /** Is there anything inside this view? */
  isViewPopulated(): boolean {
    const descs = this.descriptorsByPath[this.tab.paths[0]];
    return descs && (descs.length > 0);
  }

  /** Is context menu bound to a writable directory? */
  isWritableDirectory(desc: Descriptor): boolean {
    return desc && desc.isDirectory && desc.isWritable;
  }

  /** Is context menu bound to a writable directory? */
  isWritableFile(desc: Descriptor): boolean {
    return desc && desc.isFile && desc.isWritable;
  }

  /** Helper for ternary expr in template */
  noop(): void { }

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
    let base, path;
    switch (command) {
      // these commands are singular
      case 'homedir':
        path = this.fsSvc.homedir();
        this.store.dispatch(new ReplacePathsInTab({ paths: [path], tab: this.tab }));
        this.store.dispatch(new UpdateTab({ tab: { ...this.tab, icon: 'fas home', label: 'Home' } }));
        break;
      case 'new-dir':
      case 'new-file':
        base = this.tab.paths[0];
        if (this.isDirectory(desc))
          base = desc.path;
        else if (this.isFile(desc))
          base = this.fsSvc.dirname(desc.path);
        path = this.fsSvc.join(base, this.newName);
        const newDirOp = (command === 'new-dir')?
          NewDirOperation.makeInstance(path, this.fsSvc) :
          NewFileOperation.makeInstance(path, this.fsSvc);
        this.fsSvc.run(newDirOp);
        if (this.isDirectory(desc))
          this.store.dispatch(new AddPathToTab({ path: desc.path, tab: this.tab }));
        break;
      case 'open-new':
        this.store.dispatch(new NewTab({ splitID: this.splitID, path: desc.path }));
        break;
      case 'open-parent':
      case 'open-this':
        base = (command === 'open-parent')?
          this.fsSvc.resolve(this.fsSvc.dirname(desc.path), '..') : desc.path;
        this.store.dispatch(new ReplacePathsInTab({ paths: [base], tab: this.tab }));
        break;
      case 'properties':
        this.root.onEditProps(desc);
        break;
      case 'rename':
        const renameOp = RenameOperation.makeInstance(desc.path, this.newName, this.fsSvc);
        this.fsSvc.run(renameOp);
        break;
      // these commands affect the entire selection
      case 'clear':
        this.store.dispatch(new ClearClipboard());
        break;
      case 'ctrl+c':
        this.store.dispatch(new CopyToClipboard({ paths: this.selection.paths }));
        break;
      case 'ctrl+v':
        const pasteOp = (this.clipboard.op === 'copy')?
          CopyOperation.makeInstance(this.clipboard.paths, desc.path, this.fsSvc) :
          MoveOperation.makeInstance(this.clipboard.paths, desc.path, this.fsSvc);
        this.fsSvc.run(pasteOp);
        this.store.dispatch(new ClearClipboard());
        break;
      case 'ctrl+x':
        this.store.dispatch(new CutToClipboard({ paths: this.selection.paths }));
        break;
      case 'touch':
        const touchOp = TouchOperation.makeInstance(this.selection.paths, this.fsSvc);
        this.fsSvc.run(touchOp);
        break;
      case 'trash':
        const trashOp = TrashOperation.makeInstance(this.selection.paths, this.fsSvc);
        this.fsSvc.run(trashOp);
        break;
    }
    // if event is missing, that means we were invoked programatically
    // so we need to close the menu ourselves
    if (!event.event) {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    }
  }

  onNewName(name: string): void {
    this.newName = name;
  }

  // lifecycle methods

  ngOnInit(): void {
    this.store.dispatch(new Progress({ state: 'running' }));
    this.subToActions = this.actions$
      .pipe(
        ofAction(DirLoaded, DirUnloaded, PrefsUpdated, TabsUpdated, TabUpdated, ViewUpdated),
        filter(action => {
          switch (action.constructor) {
            case DirLoaded:
              return this.tab.paths.includes((<DirLoaded>action).payload.path);
            case DirUnloaded:
              return this.tab.paths.includes((<DirUnloaded>action).payload.path);
            case PrefsUpdated:
              return true;
            case TabsUpdated:
              return (<TabsUpdated>action).payload.splitID === this.splitID;
            case TabUpdated:
              return (<TabUpdated>action).payload.tab.id === this.tab.id;
            case ViewUpdated:
              return (<ViewUpdated>action).payload.viewID === this.tab.id;
            default:
              return false;
          }
        }),
        debounceTime(100),
      ).subscribe(() => {
        this.dictionary = this.dictSvc.dictionaryForView(this.view);
        this.tab.paths.forEach(path => {
          this.descriptorsByPath[path] =
            this.dictSvc.descriptorsForView(path, this.fs, this.dictionary, this.prefs, this.view);
        });
        if (!this.loaded)
          this.store.dispatch(new Progress({ state: 'completed' }));
        this.loaded = true;
        this.cdf.detectChanges();
      });
  }

}
