import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { View, ViewsStateModel } from '../state/views';

import { FSStateModel } from '../state/fs';
import { LifecycleComponent } from 'ellib';
import { OnChange } from 'ellib';
import { PrefsStateModel } from '../state/prefs';
import { Tab } from '../state/layout';

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

  @Input() fs: FSStateModel;
  @Input() index: number;
  @Input() prefs: PrefsStateModel;
  @Input() splitID: string;
  @Input() tabs: Tab[];
  @Input() views: ViewsStateModel;

  tab: Tab;
  tabIndex: number;
  view: View;

  // bind OnChange handlers

  @OnChange('tabs', 'views') onTabs() {
    if (this.tabs) {
      this.tab = this.tabs.find(tab => tab.selected);
      this.tabIndex = this.tabs.findIndex(tab => tab.selected);
    }
    if (this.tab && this.views)
      this.view = { ...this.views[this.tab.id] };
  }

}