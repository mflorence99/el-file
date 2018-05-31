import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CloseSplit, MakeSplit, Reorient } from '../../state/layout';
import { ShowLog, WindowStateModel } from '../../state/window';

import { ElectronService } from 'ngx-electron';
import { FSService } from '../../services/fs';
import { LayoutStateModel } from '../../state/layout';
import { MatButtonToggleChange } from '@angular/material';
import { Store } from '@ngxs/store';

/**
 * Toolbar component
 */

@Component({
  // NOTE: we hate to make an exception and use Default, but we need it -- we think --
  // to check properly the canUndo and canRedo calls in the template
  changeDetection: ChangeDetectionStrategy.Default,
  selector: 'elfile-toolbar',
  templateUrl: 'toolbar.html',
  styleUrls: ['toolbar.scss']
})

export class ToolbarComponent {

  @Input() isOpRunning: boolean;
  @Input() layout = { } as LayoutStateModel;
  @Input() window = { } as WindowStateModel;

  @Output() openPrefs = new EventEmitter<any>();

  /** ctor */
  constructor(private electron: ElectronService,
              public fsSvc: FSService,
              private store: Store) { }

  /** Is redo available? */
  canRedo() {
    return !this.isOpRunning && this.fsSvc.canRedo();
  }

  /** Is undo available? */
  canUndo() {
    return !this.isOpRunning && this.fsSvc.canUndo();
  }

  /** Open dev tools */
  devTools(): void {
    const win = this.electron.remote.getCurrentWindow();
    win.webContents.openDevTools();
  }

  /** Check orientation */
  isHorizontalOrientation(): boolean {
    return (this.layout.direction === 'horizontal') && (this.layout.splits.length === 2);
  }

  /** Check orientation */
  isStandardOrientation(): boolean {
    return this.layout.splits.length === 1;
  }

  /** Check orientation */
  isVerticalOrientation(): boolean {
    return (this.layout.direction === 'vertical') && (this.layout.splits.length === 2);
  }

  /** Reload app */
  reload(): void {
    const win = this.electron.remote.getCurrentWindow();
    win.webContents.reload();
  }

  /** Show/hide the log */
  showLog(state: boolean): void {
    this.store.dispatch(new ShowLog(state));
  }

  /** Split screen */
  split(event: MatButtonToggleChange): void {
    switch (event.value) {
      case 'standard':
        this.store.dispatch(new CloseSplit({ splitID: this.layout.id, ix: 1 }));
        break;
      case 'horizontal':
        this.store.dispatch(new Reorient({ splitID: this.layout.id, direction: 'horizontal' }));
        if (this.isStandardOrientation())
          this.store.dispatch(new MakeSplit({ splitID: this.layout.id, ix: 0, direction: 'horizontal', before: false }));
        break;
      case 'vertical':
        this.store.dispatch(new Reorient({ splitID: this.layout.id, direction: 'vertical' }));
        if (this.isStandardOrientation())
          this.store.dispatch(new MakeSplit({ splitID: this.layout.id, ix: 0, direction: 'vertical', before: false }));
        break;
    }
  }

}
