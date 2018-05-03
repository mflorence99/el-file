import { CloseSplit, Layout, LayoutPrefs, LayoutSearch, LayoutState, MakeSplit } from '../../state/layout';
import { Component, ViewChild } from '@angular/core';

import { ContextMenuComponent } from 'ngx-contextmenu';
import { DrawerPanelComponent } from 'ellib';
import { ElectronService } from 'ngx-electron';
import { SetBounds } from '../../state/window';
import { SplittableComponent } from '../../components/splittable';
import { Store } from '@ngxs/store';
import { Tab } from '../../state/tabs';
import { TerminalService } from '../../services/terminal';
import { debounce } from 'ellib';

/**
 * EL-Term Root
 */

@Component({
  selector: 'elterm-root',
  templateUrl: 'page.html',
  styleUrls: ['page.scss']
})

export class RootPageComponent {

  @ViewChild(ContextMenuComponent) contextMenu: ContextMenuComponent;
  @ViewChild(SplittableComponent) splittable: SplittableComponent;

  @ViewChild('prefsDrawer') prefsDrawer: DrawerPanelComponent;
  @ViewChild('searchDrawer') searchDrawer: DrawerPanelComponent;
  @ViewChild('tabDrawer') tabDrawer: DrawerPanelComponent;

  editPrefs = { } as LayoutPrefs;
  editPrefsID: string;

  editSearch = { } as LayoutSearch;
  editSearchID: string;

  editTab = { } as Tab;

  swapWith: string;

  /** ctor */
  constructor(private electron: ElectronService,
              private termSvc: TerminalService,
              private store: Store) {
    this.electron.ipcRenderer.on('bounds', debounce((event, bounds) => {
      this.store.dispatch(new SetBounds(bounds));
    }, 250));
  }

  /** Is the close menu enabled? */
  isCloseEnabled(item: {id: string, ix: number}): boolean {
    return (item.id !== this.splittable.layout.id)
        || (this.splittable.layout.splits.length > 1);
  }

  /** Is the copy menu enabled? */
  isCopyEnabled(item: {id: string, ix: number}): boolean {
    const layout = LayoutState.findSplitByIDImpl(this.splittable.layout, item.id);
    return this.termSvc.hasSelection(layout.splits[item.ix].id);
  }

  /** Is the paste menu enabled? */
  isPasteEnabled(item: {id: string, ix: number}): boolean {
    return !!this.electron.clipboard.readText();
  }

  /** Is the swap menu enabled? */
  isSwapEnabled(item: {id: string, ix: number}): boolean {
    return this.isCloseEnabled(item);
  }

  // event handlers

  onContextMenu(event: {event?: MouseEvent,
                        item: {id: string, ix: number}},
                command: string): void {
    const actions = [];
    const id = event.item.id;
    const ix = event.item.ix;
    const win = this.electron.remote.getCurrentWindow();
    // make sure the session has the focus
    const layout = LayoutState.findSplitByIDImpl(this.splittable.layout, id);
    const split = layout.splits[ix];
    this.termSvc.focus(split.id);
    // act on command
    switch (command) {
      case 'reload':
        win.webContents.reload();
        break;
      case 'dev-tools':
        win.webContents.openDevTools();
        break;
      case 'copy':
        this.electron.clipboard.writeText(this.termSvc.getSelection(split.id));
        break;
      case 'paste':
        this.termSvc.write(split.id, this.electron.clipboard.readText());
        break;
      case 'bashrc':
        const process = this.electron.process;
        LayoutState.visitSplits(this.splittable.layout, (split: Layout) => {
          this.termSvc.writeln(split.id, `source ${process.env['HOME']}/.bashrc`);
        });
        break;
      case 'ctrl+c':
        LayoutState.visitSplits(this.splittable.layout, (split: Layout) => {
          this.termSvc.ctrl_c(split.id);
        });
        break;
      case 'clear':
        LayoutState.visitSplits(this.splittable.layout, (split: Layout) => {
          this.termSvc.ctrl_c(split.id);
          this.termSvc.clear(split.id);
        });
        break;
      case 'prefs':
        this.editPrefs = split.prefs;
        this.editPrefsID = split.id;
        this.prefsDrawer.open();
        break;
      case 'search':
        this.editSearch = split.search;
        this.editSearchID = split.id;
        this.searchDrawer.open();
        break;
      case 'swapWith':
        this.swapWith = `${id}[${ix}]`;
        break;
      case 'vertical-':
        actions.push(new MakeSplit({ id, ix, direction: 'vertical', before: true }));
        break;
      case 'vertical+':
        actions.push(new MakeSplit({ id, ix, direction: 'vertical', before: false }));
        break;
      case 'horizontal-':
        actions.push(new MakeSplit({ id, ix, direction: 'horizontal', before: true }));
        break;
      case 'horizontal+':
        actions.push(new MakeSplit({ id, ix, direction: 'horizontal', before: false }));
        break;
      case 'close':
        actions.push(new CloseSplit({ id, ix }));
        break;
    }
    // dispatch action
    if (actions.length > 0)
      this.store.dispatch(actions);
  }

  onEditTab(tab: Tab) {
    this.editTab = tab;
    this.tabDrawer.open();
  }

}
