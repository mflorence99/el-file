import { ChangeDetectionStrategy } from '@angular/core';
import { ClipboardStateModel } from '../state/clipboard';
import { Component } from '@angular/core';
import { ElementRef } from '@angular/core';
import { FSStateModel } from '../state/fs';
import { Input } from '@angular/core';
import { LifecycleComponent } from 'ellib';
import { OnChange } from 'ellib';
import { PrefsStateModel } from '../state/prefs';
import { SelectionStateModel } from '../state/selection';
import { Tab } from '../state/layout';
import { View } from '../state/views';
import { ViewsStateModel } from '../state/views';

/**
 * Pane component
 */

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'elfile-pane',
  templateUrl: 'pane.html',
  styleUrls: ['pane.scss']
})

export class PaneComponent extends LifecycleComponent {

  @Input() clipboard = { } as ClipboardStateModel;
  @Input() fs = { } as FSStateModel;
  @Input() index: number;
  @Input() isOpRunning: boolean;
  @Input() prefs = { } as PrefsStateModel;
  @Input() selection = { } as SelectionStateModel;
  @Input() splitID: string;
  @Input() tabs = [] as Tab[];
  @Input() views = { } as ViewsStateModel;

  tab = { } as Tab;
  tabIndex: number;
  view = { } as View;

  /** ctor */
  constructor(public element: ElementRef) {
    super();
   }

  // bind OnChange handlers

  @OnChange('tabs', 'views') newState(): void {
    if (this.tabs) {
      this.tab = { ...this.tabs.find(tab => tab.selected) };
      this.tabIndex = this.tabs.findIndex(tab => tab.selected);
    }
    if (this.tab && this.views)
      this.view = { ...this.views[this.tab.id] };
  }

}
