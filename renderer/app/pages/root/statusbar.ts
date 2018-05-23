import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { StatusStateModel } from '../../state/status';

/**
 * Status bar component
 */

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'elfile-statusbar',
  templateUrl: 'statusbar.html',
  styleUrls: ['statusbar.scss']
})

export class StatusbarComponent {

  @Input() status = { } as StatusStateModel;

}
