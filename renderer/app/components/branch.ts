import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { ContextMenuComponent } from 'ngx-contextmenu';
import { Descriptor } from '../state/fs';
import { Dictionary } from '../services/dictionary';
import { FSStateModel } from '../state/fs';
import { PrefsStateModel } from '../state/prefs';
import { SelectionStateModel } from '../state/selection';
import { Tab } from '../state/layout';
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

export class BranchComponent {

  @Input() contextMenu: ContextMenuComponent;
  @Input() descriptorsByPath: { [path: string]: Descriptor[] } = { };
  @Input() dictionary: Dictionary[] = [];
  @Input() fs = { } as FSStateModel;
  @Input() level = 0;
  @Input() path: string;
  @Input() prefs = { } as PrefsStateModel;
  @Input() selection = { } as SelectionStateModel;
  @Input() tab = { } as Tab;

  /** ctor */
  constructor(public tree: TreeComponent) { }

}
