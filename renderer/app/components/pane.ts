import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { View, ViewsStateModel } from '../state/views';

import { FSStateModel } from '../state/fs';
import { LifecycleComponent } from 'ellib';
import { OnChange } from 'ellib';
import { Tab } from '../state/layout';

/**
 * Pane component
 */

@Component({
  changeDetection: ChangeDetectionStrategy.Default,
  selector: 'elfile-pane',
  templateUrl: 'pane.html',
  styleUrls: ['pane.scss']
})

export class PaneComponent extends LifecycleComponent {

  @Input() fs: FSStateModel;
  @Input() index: number;
  @Input() splitID: string;
  @Input() tabs: Tab[];
  @Input() views: ViewsStateModel;

  tab: Tab;
  tabIndex: number;
  view: View;

  // bind OnChange handlers

  @OnChange('tabs') onTabs() {
    this.tab = this.tabs.find(tab => tab.selected);
    this.tabIndex = this.tabs.findIndex(tab => tab.selected);
    this.view = this.views[this.tab.id];
  }

}
