import { AddPathToTab } from '../state/layout';
import { AutoUnsubscribe } from 'ellib';
import { ChangeDetectionStrategy } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import { ClearClipboard } from '../state/clipboard';
import { ClipboardStateModel } from '../state/clipboard';
import { Component } from '@angular/core';
import { ContextMenuComponent } from 'ngx-contextmenu';
import { CopyOperation } from '../services/copy';
import { CopyToClipboard } from '../state/clipboard';
import { CutToClipboard } from '../state/clipboard';
import { DeleteOperation } from '../services/delete';
import { Descriptor } from '../state/fs';
import { Dictionary } from '../services/dictionary';
import { DictionaryService } from '../services/dictionary';
import { ElectronService } from 'ngx-electron';
import { FSService } from '../services/fs';
import { FSStateModel } from '../state/fs';
import { Input } from '@angular/core';
import { LifecycleComponent } from 'ellib';
import { Message } from '../state/status';
import { MoveOperation } from '../services/move';
import { NewDirOperation } from '../services/new-dir';
import { NewFileOperation } from '../services/new-file';
import { NewTab } from '../state/layout';
import { OnChange } from 'ellib';
import { OnInit } from '@angular/core';
import { PrefsState } from '../state/prefs';
import { PrefsStateModel } from '../state/prefs';
import { Progress } from '../state/status';
import { RenameOperation } from '../services/rename';
import { ReplacePathsInTab } from '../state/layout';
import { RootPageComponent } from '../pages/root/page';
import { SelectionStateModel } from '../state/selection';
import { Store } from '@ngxs/store';
import { Subscription } from 'rxjs';
import { Tab } from '../state/layout';
import { TouchOperation } from '../services/touch';
import { TrashOperation } from '../services/trash';
import { UpdateTab } from '../state/layout';
import { View } from '../state/views';
import { ViewChild } from '@angular/core';

import { config } from '../config';
import { debounce } from 'ellib';

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
  @Input() isOpRunning: boolean;
  @Input() prefs = { } as PrefsStateModel;
  @Input() selection = { } as SelectionStateModel;
  @Input() splitID: string;
  @Input() tab = { } as Tab;
  @Input() view = { } as View;

  @ViewChild(ContextMenuComponent, { static: true }) contextMenu: ContextMenuComponent;

  descriptorsByPath: { [path: string]: Descriptor[] } = { };
  dictionary: Dictionary[] = [];

  loaded: boolean;
  newName: string;

  subToActions: Subscription;

  private updateDescriptors: Function;

  /** ctor */
  constructor(private cdf: ChangeDetectorRef,
              private dictSvc: DictionaryService,
              private electron: ElectronService,
              private fsSvc: FSService,
              private root: RootPageComponent,
              private store: Store) {
    super();
    this.updateDescriptors = debounce(this._updateDescriptors, config.treeRefreshThrottle);
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

  /** Is paste allowed? */
  isPastable(): boolean {
    return this.isClipboardPopulated() && !this.isOpRunning;
  }

  /** Is this path renamable? */
  isRenamable(desc: Descriptor): boolean {
    return desc && !this.isOpRunning;
  }

  /** Is this path trashable? */
  isTrashable(desc: Descriptor): boolean {
    return desc && !this.isOpRunning;
  }

  /** Is there anything inside this view? */
  isViewPopulated(): boolean {
    if (this.tab.paths && this.tab.paths.length) {
      const descs = this.descriptorsByPath[this.tab.paths[0]];
      return descs && (descs.length > 0);
    }
    else return false;
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
      }, config.prepareNewNameDelay);
    }
    return this.newName;
  }

  // event handlers

  onExecute(event: {event?: MouseEvent,
                    item: Descriptor},
            command: string): void {
    const desc = event.item || <Descriptor>{ isDirectory: true, path: this.tab.paths[0] };
    // execute command
    let base, path;
    switch (command) {

      // these commands are singular

      case 'copy-path':
        this.electron.clipboard.writeText(desc.path);
        this.store.dispatch(new Message({ text: `Copied ${desc.path} to clipboard` }));
        break;

      case 'homedir':
        path = this.fsSvc.homedir();
        this.store.dispatch(new UpdateTab({ tab: { ...this.tab, icon: 'fas home', label: 'Home', paths: [path] } }));
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

      case 'open-editor':
        this.fsSvc.exec(PrefsState.getCommandForEditor(this.prefs.codeEditor, desc.path));
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

      case 'rootdir':
        this.store.dispatch(new UpdateTab({ tab: { ...this.tab, icon: 'fas laptop', label: 'Root', paths: ['/'] } }));
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
        break;

      case 'ctrl+x':
        this.store.dispatch(new CutToClipboard({ paths: this.selection.paths }));
        break;

      case 'remove':
        const removeOp = DeleteOperation.makeInstance(this.selection.paths, this.fsSvc);
        this.fsSvc.run(removeOp);
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
    if (!event.event)
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
  }

  onNewName(name: string): void {
    this.newName = name;
  }

  // bind OnChange handlers

  @OnChange('fs', 'prefs', 'tab', 'view') newState(): void {
    if (this.fs && this.prefs && this.tab && this.view)
      this.updateDescriptors();
  }

  // lifecycle methods

  ngOnInit(): void {
    this.store.dispatch(new Progress({ state: 'running' }));
  }

  // private methods

  private _updateDescriptors(): void {
    this.dictionary = this.dictSvc.dictionaryForView(this.view);
    this.tab.paths.forEach(path => {
      this.descriptorsByPath[path] =
        this.dictSvc.descriptorsForView(path, this.fs, this.dictionary, this.prefs, this.view);
    });
    if (!this.loaded)
      this.store.dispatch(new Progress({ state: 'completed' }));
    this.loaded = true;
    this.cdf.detectChanges();
  }

}
