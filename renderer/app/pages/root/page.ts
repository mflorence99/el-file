import { Component, ViewChild } from '@angular/core';

import { DrawerPanelComponent } from 'ellib';
import { ElectronService } from 'ngx-electron';
import { SetBounds } from '../../state/window';
import { SplittableComponent } from '../../components/splittable';
import { Store } from '@ngxs/store';
import { Tab } from '../../state/layout';
import { View } from '../../state/views';
import { debounce } from 'ellib';

/**
 * EL-Term Root
 */

@Component({
  selector: 'elfile-root',
  templateUrl: 'page.html',
  styleUrls: ['page.scss']
})

export class RootPageComponent {

  @ViewChild(SplittableComponent) splittable: SplittableComponent;

  @ViewChild('tabDrawer') tabDrawer: DrawerPanelComponent;
  @ViewChild('viewDrawer') viewDrawer: DrawerPanelComponent;

  editTab = { } as Tab;
  noRemoveTab: boolean;

  editView = { } as View;
  editViewID: string;

  /** ctor */
  constructor(private electron: ElectronService,
              private store: Store) {
    this.electron.ipcRenderer.on('bounds', debounce((event, bounds) => {
      this.store.dispatch(new SetBounds(bounds));
    }, 250));
  }

  // event handlers

  onEditTab(tab: Tab,
            noRemove: boolean) {
    this.editTab = tab;
    this.noRemoveTab = noRemove;
    this.tabDrawer.open();
  }

  onEditView(view: View,
             viewID: string) {
    this.editView = view;
    this.editViewID = viewID;
    this.viewDrawer.open();
  }

}
