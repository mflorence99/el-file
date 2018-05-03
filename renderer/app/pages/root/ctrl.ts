import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Layout, LayoutState, LayoutStateModel } from '../../state/layout';
import { Tab, TabsState, TabsStateModel } from '../../state/tabs';
import { WindowState, WindowStateModel } from '../../state/window';
import { map, switchMap, take } from 'rxjs/operators';

import { ElectronService } from 'ngx-electron';
import { Observable } from 'rxjs/Observable';
import { Select } from '@ngxs/store';

/**
 * Root controller
 */

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'elterm-root-ctrl',
  styles: [':host { display: none; }'],
  template: ''
})

export class RootCtrlComponent {

  @Select(LayoutState) layouts$: Observable<LayoutStateModel>;
  @Select(TabsState) tabs$: Observable<TabsStateModel>;
  @Select(WindowState) window$: Observable<WindowStateModel>;

  tab$: Observable<Tab> = this.tabs$.pipe(
    map((tabs: TabsStateModel) => tabs.tabs.find(tab => tab.selected))
  );

  tabIndex$: Observable<number> = this.tabs$.pipe(
    map((tabs: TabsStateModel) => tabs.tabs.findIndex(tab => tab.selected))
  );

  layout$: Observable<Layout> = this.tab$.pipe(
    switchMap((tab: Tab) => {
      return this.layouts$.pipe(
        map((model: LayoutStateModel) => model[tab.id])
      );
    })
  );

  /** ctor */
  constructor(private electron: ElectronService) {
    this.window$.pipe(take(1))
      .subscribe((window: WindowStateModel) => {
        const win = this.electron.remote.getCurrentWindow();
        if (window.bounds)
          win.setBounds(window.bounds);
      });
  }

}
