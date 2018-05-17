import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { FSStateModel } from '../state/fs';
import { Tab } from '../state/layout';
import { View } from '../state/views';

/**
 * Branch component
 */

@Component({
  changeDetection: ChangeDetectionStrategy.Default,
  selector: 'elfile-branch',
  templateUrl: 'branch.html',
  styleUrls: ['branch.scss']
})

export class BranchComponent {

  @Input() fs: FSStateModel;
  @Input() tab: Tab;
  @Input() view: View;

}
