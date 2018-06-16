import { ChangeDetectionStrategy } from '@angular/core';
import { ChmodOperation } from '../../services/chmod';
import { ClipboardState } from '../../state/clipboard';
import { ClipboardStateModel } from '../../state/clipboard';
import { Component } from '@angular/core';
import { ElectronService } from 'ngx-electron';
import { FSLogState } from '../../state/fslog';
import { FSLogStateModel } from '../../state/fslog';
import { FSService } from '../../services/fs';
import { FSState } from '../../state/fs';
import { FSStateModel } from '../../state/fs';
import { Input } from '@angular/core';
import { LayoutState } from '../../state/layout';
import { LayoutStateModel } from '../../state/layout';
import { LifecycleComponent } from 'ellib';
import { Observable } from 'rxjs';
import { OnChange } from 'ellib';
import { PrefsState } from '../../state/prefs';
import { PrefsStateModel } from '../../state/prefs';
import { RenameOperation } from '../../services/rename';
import { Select } from '@ngxs/store';
import { SelectionState } from '../../state/selection';
import { SelectionStateModel } from '../../state/selection';
import { StatusState } from '../../state/status';
import { StatusStateModel } from '../../state/status';
import { Store } from '@ngxs/store';
import { UpdatePrefs } from '../../state/prefs';
import { UpdateViewVisibility } from '../../state/views';
import { ViewsState } from '../../state/views';
import { ViewsStateModel } from '../../state/views';
import { ViewVisibility } from '../../state/views';
import { WindowState } from '../../state/window';
import { WindowStateModel } from '../../state/window';

import { nextTick } from 'ellib';
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

export class RootCtrlComponent extends LifecycleComponent {

  @Input() prefsForm = { } as PrefsStateModel;
  @Input() propsForm: any = { };
  @Input() viewForm: any = { };

  @Select(ClipboardState) clipboard$: Observable<ClipboardStateModel>;
  @Select(FSState) fs$: Observable<FSStateModel>;
  @Select(FSLogState) fslog$: Observable<FSLogStateModel>;
  @Select(LayoutState) layout$: Observable<LayoutStateModel>;
  @Select(PrefsState) prefs$: Observable<PrefsStateModel>;
  @Select(SelectionState) selection$: Observable<SelectionStateModel>;
  @Select(StatusState) status$: Observable<StatusStateModel>;
  @Select(StatusState.isOpRunning) isOpRunning$: Observable<boolean>;
  @Select(ViewsState) views$: Observable<ViewsStateModel>;
  @Select(WindowState) window$: Observable<WindowStateModel>;

  /** ctor */
  constructor(private electron: ElectronService,
              private fsSvc: FSService,
              private store: Store) {
    super();
    // set the initial bounds
    this.window$.pipe(take(1))
      .subscribe((window: WindowStateModel) => {
        const win = this.electron.remote.getCurrentWindow();
        if (window.bounds)
          win.setBounds(window.bounds);
      });
  }

  // bind OnChange handlers

  @OnChange('prefsForm') savePrefs(): void {
    if (this.prefsForm && this.prefsForm.submitted) {
      // TODO: why do we need this in Electron? and only running live?
      // at worst, running in NgZone should work -- but otherwise a DOM
      // event is necessary to force change detection
      nextTick(() => {
        this.store.dispatch(new UpdatePrefs(this.prefsForm));
      });
    }
  }

  @OnChange('propsForm') updateProps(): void {
    if (this.propsForm && this.propsForm.submitted) {
      const renameOp = RenameOperation.makeInstance(this.propsForm.path, this.propsForm.name, this.fsSvc);
      const chmodOp = ChmodOperation.makeInstance(this.propsForm.path, this.propsForm.mode, this.fsSvc);
      // NOTE: run chmod first in case we rename
      this.fsSvc.run(chmodOp, renameOp);
    }
  }

  @OnChange('viewForm') saveView(): void {
    if (this.viewForm && this.viewForm.submitted) {
      // TODO: why do we need this in Electron? and only running live?
      // at worst, running in NgZone shoukd work -- but otherwise a DOM
      // event is necessary to force change detection
      nextTick(() => {
        const allTheSame = !!this.viewForm.allTheSame;
        const viewID = this.viewForm.viewID;
        const visibility: ViewVisibility = { ...this.viewForm.visibility };
        this.store.dispatch(new UpdateViewVisibility({ viewID, visibility, allTheSame }));
      });
    }
  }

}
