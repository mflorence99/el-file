import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { Tab, UpdatePathLRU } from '../state/layout';

import { ClipboardStateModel } from '../state/clipboard';
import { ContextMenuComponent } from 'ngx-contextmenu';
import { Descriptor } from '../state/fs';
import { Dictionary } from '../services/dictionary';
import { FSStateModel } from '../state/fs';
import { PrefsStateModel } from '../state/prefs';
import { SelectionStateModel } from '../state/selection';
import { Store } from '@ngxs/store';
import { TreeComponent } from './tree';

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

  // lifecycle methods

  ngOnInit(): void {
    this.store.dispatch(new UpdatePathLRU({ path: this.path, tab: this.tab}));
  }

}
