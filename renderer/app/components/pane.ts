import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

/**
 * Pane component
 */

@Component({
  changeDetection: ChangeDetectionStrategy.Default,
  selector: 'elfile-pane',
  templateUrl: 'pane.html',
  styleUrls: ['pane.scss']
})

export class PaneComponent {

  @Input() index: number;
  @Input() splitID: string;

}
