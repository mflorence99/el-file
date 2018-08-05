import { ChangeDetectionStrategy } from '@angular/core';
import { ClipboardStateModel } from '../state/clipboard';
import { Component } from '@angular/core';
import { ContextMenuComponent } from 'ngx-contextmenu';
import { Descriptor } from '../state/fs';
import { Dictionary } from '../services/dictionary';
import { FSStateModel } from '../state/fs';
import { Input } from '@angular/core';
import { LoadDirs } from '../state/fs';
import { OnInit } from '@angular/core';
import { PrefsStateModel } from '../state/prefs';
import { SelectionStateModel } from '../state/selection';
import { Store } from '@ngxs/store';
import { Tab } from '../state/layout';
import { TreeComponent } from './tree';
import { UpdatePathLRU } from '../state/layout';

/**
 * Branch component
 */

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'elfile-branch',
  templateUrl: 'branch.html',
  styleUrls: ['branch.scss']
})

export class BranchComponent implements OnInit {

  @Input() clipboard = { } as ClipboardStateModel;
  @Input() contextMenu: ContextMenuComponent;
  @Input() descriptorsByPath: { [path: string]: Descriptor[] } = { };
  @Input() dictionary: Dictionary[] = [];
  @Input() fs = { } as FSStateModel;
  @Input() isOpRunning: boolean;
  @Input() level = 0;
  @Input() path: string;
  @Input() prefs = { } as PrefsStateModel;
  @Input() selection = { } as SelectionStateModel;
  @Input() tab = { } as Tab;

  /** ctor */
  constructor(private store: Store,
              public tree: TreeComponent) { }

  /** *ngFor assist */
  trackDesc(index: number,
            desc: Descriptor): string {
    return desc.path;
  }

  // lifecycle methods

  ngOnInit(): void {
    this.store.dispatch([
      new LoadDirs({ paths: [this.path] }),
      new UpdatePathLRU({ path: this.path, tab: this.tab})
    ]);
  }

}
