import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { View } from '../state/views';

/**
 * Header component
 */

@Component({
  changeDetection: ChangeDetectionStrategy.Default,
  selector: 'elfile-header',
  templateUrl: 'header.html',
  styleUrls: ['header.scss']
})

export class HeaderComponent {

  @Input() view: View;

}
