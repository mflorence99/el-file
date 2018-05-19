import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { DictionaryService } from '../services/dictionary';
import { DrawerPanelComponent } from 'ellib';
import { LifecycleComponent } from 'ellib';
import { OnChange } from 'ellib';
import { View } from '../state/views';
import { map } from 'rxjs/operators';

/**
 * View component
 */

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'elfile-view',
  templateUrl: 'view.html',
  styleUrls: ['view.scss']
})

export class ViewComponent extends LifecycleComponent {

  @Input() view: View;
  @Input() viewID: string;

  viewForm: FormGroup;

  /** ctor */
  constructor(private dict: DictionaryService,
              private drawerPanel: DrawerPanelComponent,
              private formBuilder: FormBuilder) {
    super();
    // derive visibility controls from dictionary
    const visibility = this.dict.dictionary().reduce((acc, entry) => {
      acc[entry.name] = '';
      return acc;
    }, { });
    // create view form controls
    this.viewForm = this.formBuilder.group({
      allTheSame: '',
      atLeastOne: ['', Validators.required],
      submitted: '',
      viewID: '',
      visibility: this.formBuilder.group(visibility)
    });
    // make sure at least one visibility
    this.viewForm.get('visibility').valueChanges
      .pipe(
        map(visibility => Object.entries(visibility)),
        map(entries => entries.some(entry => !!entry[1])),
        map(atLeastOne => atLeastOne? 'atLeastOne' : null)
      ).subscribe(atLeastOne => this.viewForm.get('atLeastOne').setValue(atLeastOne));
  }

  /** Close drawer */
  close() {
    this.drawerPanel.close();
  }

  // bind OnChange handlers

  @OnChange('view') patchView() {
    if (this.view && this.view.visibility)
      this.viewForm.patchValue({ visibility: this.view.visibility }, { emitEvent: true });
  }

  @OnChange('viewID') patchViewID() {
    if (this.viewID) {
      this.viewForm.reset();
      this.viewForm.patchValue({ viewID: this.viewID }, { emitEvent: false });
    }
  }

}
