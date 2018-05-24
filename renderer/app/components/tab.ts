import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { DrawerPanelComponent, LifecycleComponent, OnChange, nextTick } from 'ellib';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RemoveTab, Tab, UpdateTab } from '../state/layout';

import { Store } from '@ngxs/store';

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

  onCancel(): void {
    this.areYouSure = false;
    this.drawerPanel.close();
  }

  onClear(nm: string): void {
    this.tabForm.patchValue({ [nm]: '' }, { emitEvent: false });
  }

  onRemove(areYouSure: boolean): void {
    if (areYouSure) {
      // NOTE: we need to make sure a tab is selected after we delete
      // one that itself may have been selected -- we also delay removal
      // so this component can clean up first
      nextTick(() => this.store.dispatch(new RemoveTab({ tab: this.tab })));
      this.onCancel();
    }
    else this.areYouSure = true;
  }

  onSubmit(): void {
    const tab: Tab = { ...this.tab, ...this.tabForm.value };
    this.store.dispatch(new UpdateTab({ tab }));
    this.onCancel();
  }

  // bind OnChange handlers

  @OnChange('tab') patchTab(): void {
    this.areYouSure = false;
    if (this.tab)
      this.tabForm.patchValue(this.tab, { emitEvent: false });
  }

}
