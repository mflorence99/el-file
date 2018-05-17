import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { FSStateModel } from '../state/fs';
import { Tab } from '../state/layout';
import { View } from '../state/views';

/**
 * Tree component
 */

@Component({
  changeDetection: ChangeDetectionStrategy.Default,
  selector: 'elfile-tree',
  templateUrl: 'tree.html',
  styleUrls: ['tree.scss']
})

export class TreeComponent {

  @Input() fs: FSStateModel;
  @Input() tab: Tab;
  @Input() view: View;

}
