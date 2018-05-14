import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { FSStateModel } from '../state/fs';
import { Tab } from '../state/layout';

/**
 * Pane component
 */

@Component({
  changeDetection: ChangeDetectionStrategy.Default,
  selector: 'elfile-tree',
  templateUrl: 'tree.html',
  styleUrls: ['tree.scss']
})

export class TreeComponent {

  @Input() fs: FSStateModel;
  @Input() splitID: string;
  @Input() tab: Tab;

}
