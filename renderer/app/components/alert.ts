import { ChangeDetectionStrategy } from '@angular/core';
import { Component } from '@angular/core';
import { DrawerPanelComponent } from 'ellib';
import { Input } from '@angular/core';
import { LifecycleComponent } from 'ellib';
import { OnChange } from 'ellib';
import { StatusStateModel } from '../state/status';

/**
 * Alert component
 */

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'elfile-alert',
  templateUrl: 'alert.html',
  styleUrls: ['alert.scss']
})

export class AlertComponent extends LifecycleComponent {

  @Input() status = { } as StatusStateModel;

  explanation: string;
  message: string;
  
  /** ctor */
  constructor(private drawerPanel: DrawerPanelComponent) {
    super();
  }

  // bind OnChange handlers

  @OnChange('status') onAlert(): void {
    if (this.status && (this.status.message.level === 'error')) {
      this.explanation = this.status.message.explanation;
      this.message = this.status.message.text;
      this.drawerPanel.open();
    }
  }

}
