import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import { Descriptor } from '../services/dictionary';
import { DrawerPanelComponent } from 'ellib';

/**
 * Props component
 */

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'elfile-props',
  templateUrl: 'props.html',
  styleUrls: ['props.scss']
})

export class PropsComponent {

  @Input() desc = { } as Descriptor;

  propsForm: FormGroup;

  /** ctor */
  constructor(private drawerPanel: DrawerPanelComponent,
              private formBuilder: FormBuilder) {
    this.propsForm = this.formBuilder.group({

    });
  }

  /** Close drawer */
  close() {
    this.drawerPanel.close();
  }

}
