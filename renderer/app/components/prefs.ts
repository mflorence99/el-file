import { ChangeDetectionStrategy } from '@angular/core';
import { Component } from '@angular/core';
import { DrawerPanelComponent } from 'ellib';
import { FormBuilder } from '@angular/forms';
import { FormGroup } from '@angular/forms';
import { Input } from '@angular/core';
import { LifecycleComponent } from 'ellib';
import { OnChange } from 'ellib';
import { PrefsState } from '../state/prefs';
import { PrefsStateModel } from '../state/prefs';

/**
 * Prefs component
 */

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'elfile-prefs',
  templateUrl: 'prefs.html',
  styleUrls: ['prefs.scss']
})

export class PrefsComponent extends LifecycleComponent {

  @Input() prefs = { } as PrefsStateModel;

  prefsForm: FormGroup;

  editors = PrefsState.getCodeEditors();

  size = 259673;
  today = Date.now();

  /** ctor */
  constructor(private drawerPanel: DrawerPanelComponent,
              private formBuilder: FormBuilder) {
    super();
    // create prefs form controls
    this.prefsForm = this.formBuilder.group({
      codeEditor: '',
      dateFormat: '',
      quantityFormat: '',
      showGridLines: false,
      showHiddenFiles: false,
      showOnlyWritableFiles: false,
      sortDirectories: '',
      timeFormat: ''
    });
  }

  /** Close drawer */
  close(): void {
    this.drawerPanel.close();
  }

  // bind OnChange handlers

  @OnChange('prefs') patchPrefs(): void {
    if (this.prefs)
      this.prefsForm.patchValue(this.prefs, { emitEvent: false });
  }

}
