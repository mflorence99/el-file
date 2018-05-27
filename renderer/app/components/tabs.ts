import { ChangeDetectionStrategy, Component, Input, ViewChild } from '@angular/core';
import { MoveTab, RemoveTab, SelectTab, Tab } from '../state/layout';

import { ContextMenuComponent } from 'ngx-contextmenu';
import { RootPageComponent } from '../pages/root/page';
import { Store } from '@ngxs/store';
import { View } from '../state/views';
import { nextTick } from 'ellib';

/**
 * Tabs component
 */

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'elfile-tabs',
  templateUrl: 'tabs.html',
  styleUrls: ['tabs.scss']
})

export class TabsComponent {

  @Input() splitID: string;
  @Input() tabs = [] as Tab[];
  @Input() tabIndex: number;
  @Input() view = { } as View;

  @ViewChild(ContextMenuComponent) contextMenu: ContextMenuComponent;

  /** ctor */
  constructor(private root: RootPageComponent,
              private store: Store) {  }

  /** Is this tab removeable? */
  isTabRemoveable(tab: Tab): boolean {
    return this.tabs.length > 0;
  }

  // event handlers

  onExecute(event: {event?: MouseEvent,
                    item: Tab},
            command: string): void {
    const tab = event.item;
    switch (command) {
      case 'edit':
        this.root.onEditTab(tab);
        break;
      case 'remove':
        // NOTE: we need to make sure a tab is selected after we delete
        // one that itself may have been selected -- we also delay removal
        // so this component can clean up first
        nextTick(() => this.store.dispatch(new RemoveTab({ tab })));
        break;
    }
  }

  onEditView(): void {
    this.root.onEditView(this.view, this.tabs[this.tabIndex].id);
  }

  onMoveTab(tab: Tab,
            ix: number): void {
    this.store.dispatch([
      new MoveTab({ splitID: this.splitID, tab, ix }),
      new SelectTab({ tab })
    ]);
  }

  onTabSelect(ix: number): void {
    this.store.dispatch(new SelectTab({ tab: this.tabs[ix] }));
  }

}
