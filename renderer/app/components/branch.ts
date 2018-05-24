import { AddPathToSelection, ClearSelection, SelectionStateModel, TogglePathInSelection } from '../state/selection';
import { AddPathToTab, RemovePathFromTab, Tab } from '../state/layout';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { ContextMenuComponent } from 'ngx-contextmenu';
import { Descriptor } from '../state/fs';
import { Dictionary } from '../services/dictionary';
import { PrefsStateModel } from '../state/prefs';
import { Store } from '@ngxs/store';

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
  @Input() level = 0;
  @Input() path: string;
  @Input() prefs = { } as PrefsStateModel;
  @Input() selection = { } as SelectionStateModel;
  @Input() tab = { } as Tab;

  /** ctor */
  constructor(private store: Store) { }

  // event handlers

  onExpand(event: MouseEvent,
           path: string): void {
    const action = this.tab.paths.includes(path)?
      new RemovePathFromTab({ path, tab: this.tab }) :
      new AddPathToTab({ path, tab: this.tab });
    this.store.dispatch(action);
    event.stopPropagation();
  }

  onSelect(event: MouseEvent,
           path: string): void {
    const actions = [];
    if (event.shiftKey) {

    }
    else if (event.ctrlKey)
      actions.push(new TogglePathInSelection({ path }));
    else {
      actions.push(new ClearSelection());
      actions.push(new AddPathToSelection({ path }));
    }
    if (actions.length > 0)
      this.store.dispatch(actions);
  }

}
