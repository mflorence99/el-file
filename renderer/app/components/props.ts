import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Descriptor } from '../state/fs';
import { DictionaryService } from '../services/dictionary';
import { DrawerPanelComponent } from 'ellib';
import { LifecycleComponent } from 'ellib';
import { OnChange } from 'ellib';
import { PrefsStateModel } from '../state/prefs';

/**
 * Props component
 */

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'elfile-props',
  templateUrl: 'props.html',
  styleUrls: ['props.scss']
})

export class PropsComponent extends LifecycleComponent {

  @Input() desc = { } as Descriptor;
  @Input() prefs = { } as PrefsStateModel;

  propsForm: FormGroup;

  /** ctor */
  constructor(public dictSvc: DictionaryService,
              private drawerPanel: DrawerPanelComponent,
              private formBuilder: FormBuilder) {
    super();
    // create prefs form controls
    this.propsForm = this.formBuilder.group({
      name: ['', Validators.required],
      path: ''
    });
  }

  /** Close drawer */
  close() {
    this.drawerPanel.close();
  }

  // bind OnChange handlers

  @OnChange('desc') patchProps() {
    if (this.desc) {
      this.propsForm.reset();
      this.propsForm.patchValue(this.desc, { emitEvent: false });
    }
  }

}
