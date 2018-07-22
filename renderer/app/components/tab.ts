import { ChangeDetectionStrategy } from '@angular/core';
import { Component } from '@angular/core';
import { DrawerPanelComponent } from 'ellib';
import { FormBuilder } from '@angular/forms';
import { FormGroup } from '@angular/forms';
import { Input } from '@angular/core';
import { LifecycleComponent } from 'ellib';
import { OnChange } from 'ellib';
import { Store } from '@ngxs/store';
import { Tab } from '../state/layout';
import { UpdateTab } from '../state/layout';
import { Validators } from '@angular/forms';

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

  @Input() tab = { } as Tab;

  tabForm: FormGroup;

  /** ctor */
  constructor(private drawerPanel: DrawerPanelComponent,
              private formBuilder: FormBuilder,
              private store: Store) {
    super();
    this.tabForm = this.formBuilder.group({
      color: ['', Validators.required],
      label: ['', Validators.required],
      icon: ['', Validators.required]
    });
  }

  // event handlers

  onCancel(): void {
    this.drawerPanel.close();
  }

  onClear(nm: string): void {
    this.tabForm.patchValue({ [nm]: '' }, { emitEvent: false });
  }

  onSubmit(): void {
    const tab: Tab = { ...this.tab, ...this.tabForm.value };
    this.store.dispatch(new UpdateTab({ tab }));
    this.onCancel();
  }

  // bind OnChange handlers

  @OnChange('tab') newState(): void {
    if (this.tab)
      this.tabForm.patchValue(this.tab, { emitEvent: false });
  }

}
