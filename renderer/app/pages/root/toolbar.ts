import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CloseSplit, MakeSplit, Reorient } from '../../state/layout';

import { ElectronService } from 'ngx-electron';
import { LayoutStateModel } from '../../state/layout';
import { MatButtonToggleChange } from '@angular/material';
import { Store } from '@ngxs/store';

/**
 * Toolbar component
 */

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'elfile-toolbar',
  templateUrl: 'toolbar.html',
  styleUrls: ['toolbar.scss']
})

export class ToolbarComponent {

  @Input() layout: LayoutStateModel;

  @Output() openPrefs = new EventEmitter<any>();

  /** ctor */
  constructor(private electron: ElectronService,
              private store: Store) { }

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

  /** Split screen */
  split(event: MatButtonToggleChange): void {
    switch (event.value) {
      case 'standard':
        this.store.dispatch(new CloseSplit({ id: this.layout.id, ix: 1 }));
        break;
      case 'horizontal':
        this.store.dispatch(new Reorient({ id: this.layout.id, direction: 'horizontal' }));
        if (this.isStandardOrientation())
          this.store.dispatch(new MakeSplit({ id: this.layout.id, ix: 0, direction: 'horizontal', before: false }));
        break;
      case 'vertical':
        this.store.dispatch(new Reorient({ id: this.layout.id, direction: 'vertical' }));
        if (this.isStandardOrientation())
          this.store.dispatch(new MakeSplit({ id: this.layout.id, ix: 0, direction: 'vertical', before: false }));
        break;
    }
  }

}
