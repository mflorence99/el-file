import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { DrawerPanelComponent, LifecycleComponent, OnChange } from 'ellib';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { DictionaryService } from '../services/dictionary';
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

  @Input() view = { } as View;
  @Input() viewID: string;

  viewForm: FormGroup;

  /** ctor */
  constructor(public dictSvc: DictionaryService,
              private drawerPanel: DrawerPanelComponent,
              private formBuilder: FormBuilder) {
    super();
    // derive visibility controls from dictionary
    const visibility = this.dictSvc.dictionary().reduce((acc, entry) => {
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
  close(): void {
    this.drawerPanel.close();
  }

  // bind OnChange handlers

  @OnChange('view') patchView(): void {
    if (this.view && this.view.visibility)
      this.viewForm.patchValue({ visibility: this.view.visibility }, { emitEvent: true });
  }

  @OnChange('viewID') patchViewID(): void {
    if (this.viewID) {
      this.viewForm.reset();
      this.viewForm.patchValue({ viewID: this.viewID }, { emitEvent: false });
    }
  }

}
