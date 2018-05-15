import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RemoveTab, Tab, UpdateTab } from '../state/layout';

import { DrawerPanelComponent } from 'ellib';
import { LifecycleComponent } from 'ellib';
import { OnChange } from 'ellib';
import { Store } from '@ngxs/store';
import { nextTick } from 'ellib';

/**
 * Tab component
 */

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'elfile-tab',
  templateUrl: 'tab.html',
  styleUrls: ['tab.scss']
})

export class TabComponent extends LifecycleComponent {

  @Input() noRemove: boolean;
  @Input() tab = { } as Tab;

  areYouSure: boolean;
  tabForm: FormGroup;

  /** ctor */
  constructor(private drawerPanel: DrawerPanelComponent,
              private formBuilder: FormBuilder,
              private store: Store) {
    super();
    this.tabForm = this.formBuilder.group({
      label: ['', Validators.required],
      icon: ['', Validators.required],
      color: ['', Validators.required]
    });
  }

  // event handlers

  onCancel() {
    this.areYouSure = false;
    this.drawerPanel.close();
  }

  onClear(nm: string) {
    this.tabForm.patchValue({ [nm]: '' }, { emitEvent: false });
  }

  onRemove(areYouSure: boolean) {
    if (areYouSure) {
      // NOTE: we need to make sure a tab is selected after we delete
      // one that itself may have been selected -- we also delay removal
      // so this component can clean up first
      nextTick(() => this.store.dispatch(new RemoveTab(this.tab)));
      this.onCancel();
    }
    else this.areYouSure = true;
  }

  onSubmit() {
    this.store.dispatch(new UpdateTab({ id: this.tab.id, ...this.tabForm.value }));
    this.onCancel();
  }

  // bind OnChange handlers

  @OnChange('tab') patchTab() {
    this.areYouSure = false;
    if (this.tab)
      this.tabForm.patchValue(this.tab, { emitEvent: false });
  }

}
