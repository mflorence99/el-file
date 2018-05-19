import { ChangeDetectionStrategy, Component } from '@angular/core';

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

}
