import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LayoutState, LayoutStateModel } from '../../state/layout';
import { Select, Store } from '@ngxs/store';
import { WindowState, WindowStateModel } from '../../state/window';

import { ElectronService } from 'ngx-electron';
import { LoadDir } from '../../state/fs';
import { Observable } from 'rxjs/Observable';
import { take } from 'rxjs/operators';

/**
 * Root controller
 */

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'elfile-root-ctrl',
  styles: [':host { display: none; }'],
  template: ''
})

export class RootCtrlComponent {

  @Select(LayoutState) layout$: Observable<LayoutStateModel>;
  @Select(WindowState) window$: Observable<WindowStateModel>;

  /** ctor */
  constructor(private electron: ElectronService,
              private store: Store) {
    this.window$.pipe(take(1))
      .subscribe((window: WindowStateModel) => {
        const win = this.electron.remote.getCurrentWindow();
        if (window.bounds)
          win.setBounds(window.bounds);
      });
    // TODO: test
    this.store.dispatch(new LoadDir('/'));
    this.store.dispatch(new LoadDir('/home/mflo'));
  }

}
