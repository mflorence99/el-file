import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MoveTab, SelectTab, Tab } from '../state/layout';

import { RootPageComponent } from '../pages/root/page';
import { Store } from '@ngxs/store';

/**
 * Pane component
 */

@Component({
  changeDetection: ChangeDetectionStrategy.Default,
  selector: 'elfile-tabs',
  templateUrl: 'tabs.html',
  styleUrls: ['tabs.scss']
})

export class TabsComponent {

  @Input() splitID: string;
  @Input() tabs: Tab[];
  @Input() tabIndex: number;

  /** ctor */
  constructor(private root: RootPageComponent,
              private store: Store) {  }

  // event handlers

  onEditTab(event: MouseEvent,
            tab: Tab) {
    this.root.onEditTab(tab, (this.tabs.length === 1));
    event.stopPropagation();
  }

  onMoveTab(tab: Tab,
            ix: number) {
    this.store.dispatch(new MoveTab({ id: this.splitID, tab, ix }));
  }

  onTabSelect(ix: number) {
    this.store.dispatch(new SelectTab(this.tabs[ix]));
  }

}
