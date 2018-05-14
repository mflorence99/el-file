import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { Tab } from '../state/layout';

/**
 * Pane component
 */

@Component({
  changeDetection: ChangeDetectionStrategy.Default,
  selector: 'elfile-tabs',
  templateUrl: 'tabs.html',
  styleUrls: ['tabs.scss']
})

export class TabsComponent {

  @Input() splitID: string;
  @Input() tabs: Tab[];
  @Input() tabIndex: number;

}
