import { Component, ViewChild } from '@angular/core';
import { DrawerPanelComponent, debounce } from 'ellib';

import { Alarm } from '../../state/status';
import { Descriptor } from '../../state/fs';
import { ElectronService } from 'ngx-electron';
import { FSService } from '../../services/fs';
import { SetBounds } from '../../state/window';
import { SplittableComponent } from '../../components/splittable';
import { Store } from '@ngxs/store';
import { Tab } from '../../state/layout';
import { View } from '../../state/views';

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

  @ViewChild('propsDrawer') propsDrawer: DrawerPanelComponent;
  @ViewChild('tabDrawer') tabDrawer: DrawerPanelComponent;
  @ViewChild('viewDrawer') viewDrawer: DrawerPanelComponent;

  editDesc = { } as Descriptor;

  editTab = { } as Tab;
  noRemoveTab: boolean;

  editView = { } as View;
  editViewID: string;

  /** ctor */
  constructor(private electron: ElectronService,
              private fsSvc: FSService,
              private store: Store) {
    this.electron.ipcRenderer.on('bounds', debounce((event, bounds) => {
      this.store.dispatch(new SetBounds(bounds));
    }, 250));
  }

  // event handlers

  onEditProps(desc: Descriptor): void {
    this.editDesc = desc;
    this.propsDrawer.open();
  }

  onEditTab(tab: Tab): void {
    this.editTab = tab;
    this.tabDrawer.open();
  }

  onEditView(view: View,
             viewID: string): void {
    this.editView = view;
    this.editViewID = viewID;
    this.viewDrawer.open();
  }

  onKeystroke(event: KeyboardEvent): void {
    if (event.ctrlKey) {
      switch (event.key) {
        case 'z':
          if (this.fsSvc.canUndo())
            this.fsSvc.undo();
          else this.store.dispatch(new Alarm({ alarm: true }));
          break;
        case 'y':
          if (this.fsSvc.canRedo())
            this.fsSvc.redo();
          else this.store.dispatch(new Alarm({ alarm: true }));
          break;
      }
    }
  }

}
