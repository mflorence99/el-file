import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { RootPageComponent } from '../pages/root/page';
import { View } from '../state/views';

/**
 * Header component
 */

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'elfile-header',
  templateUrl: 'header.html',
  styleUrls: ['header.scss']
})

export class HeaderComponent {

  @Input() view: View;
  @Input() viewID: string;

  /** ctor */
  constructor(private root: RootPageComponent) {  }

  onEditView() {
    this.root.onEditView(this.view, this.viewID);
  }

}
