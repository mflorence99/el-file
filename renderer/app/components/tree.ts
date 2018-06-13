import { AddPathToTab, NewTab, ReplacePathsInTab, Tab, UpdateTab } from '../state/layout';
import { AutoUnsubscribe, LifecycleComponent, OnChange, debounce } from 'ellib';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { ClearClipboard, ClipboardStateModel, CopyToClipboard, CutToClipboard } from '../state/clipboard';
import { Dictionary, DictionaryService } from '../services/dictionary';
import { PrefsState, PrefsStateModel } from '../state/prefs';

import { ContextMenuComponent } from 'ngx-contextmenu';
import { CopyOperation } from '../services/copy';
import { DeleteOperation } from '../services/delete';
import { Descriptor } from '../state/fs';
import { FSService } from '../services/fs';
import { FSStateModel } from '../state/fs';
import { Hydrateable } from './hydrateable';
import { MoveOperation } from '../services/move';
import { NewDirOperation } from '../services/new-dir';
import { NewFileOperation } from '../services/new-file';
import { Progress } from '../state/status';
import { RenameOperation } from '../services/rename';
import { RootPageComponent } from '../pages/root/page';
import { SelectionStateModel } from '../state/selection';
import { Store } from '@ngxs/store';
import { Subscription } from 'rxjs';
import { TouchOperation } from '../services/touch';
import { TrashOperation } from '../services/trash';
import { View } from '../state/views';
import { config } from '../config';

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

  @ViewChild(ContextMenuComponent) contextMenu: ContextMenuComponent;

  descriptorsByPath: { [path: string]: Descriptor[] } = { };
  dictionary: Dictionary[] = [];

  intersectionObserver: IntersectionObserver;

  loaded: boolean;
  newName: string;

  subToActions: Subscription;

  private hydrateables: { [path: string]: Hydrateable } = { };
  private updateDescriptors: Function;

  /** ctor */
  constructor(private cdf: ChangeDetectorRef,
              private dictSvc: DictionaryService,
              private element: ElementRef,
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

  /** Register hydrateable component */
  registerHydrateable(hydrateable: Hydrateable): void {
    this.hydrateables[hydrateable.path] = hydrateable;
    this.intersectionObserver.observe(hydrateable.element.nativeElement);
  }

  /** Unregister hydrateable component */
  unregisterHydrateable(hydrateable: Hydrateable): void {
    this.intersectionObserver.unobserve(hydrateable.element.nativeElement);
    delete this.hydrateables[hydrateable.path];
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
        this.store.dispatch(new ClearClipboard());
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

  @OnChange('fs', 'prefs', 'tab', 'view') onChange(): void {
    if (this.fs && this.prefs && this.tab && this.view)
      this.updateDescriptors();
  }

  // lifecycle methods

  ngOnInit(): void {
    this.store.dispatch(new Progress({ state: 'running' }));
    // establish observer to support virtual scroll
    this.intersectionObserver = new IntersectionObserver(this.intersectionCB.bind(this), {
      root: this.element.nativeElement,
      rootMargin: '320px',
      threshold: [0]
    });
  }

  // private methods

  private intersectionCB(entries: IntersectionObserverEntry[],
                         observer: IntersectionObserver): void {
    entries.forEach(entry => {
      const hydrateable = this.hydrateables[entry.target.getAttribute('path')];
      if (hydrateable) {
        const isNow = entry.isIntersecting;
        const was = hydrateable.hydrated;
        if (was !== isNow) {
          const path = hydrateable.path;
          if (isNow)
            console.log(`%cHydrate %c${path}`, 'color: #1b5e20', 'color: grey');
          else console.log(`%cDehydrate %c${path}`, 'color: #b71c1c', 'color: grey');
          hydrateable.hydrated = isNow;
          hydrateable.repaint();
        }
      }
    });
  }

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
