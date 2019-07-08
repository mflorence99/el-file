import { Alarm } from '../../state/status';
import { Canceled } from '../../state/status';
import { ChangeDetectionStrategy } from '@angular/core';
import { Component } from '@angular/core';
import { Input } from '@angular/core';
import { LifecycleComponent } from 'ellib';
import { OnChange } from 'ellib';
import { StatusStateModel } from '../../state/status';
import { Store } from '@ngxs/store';
import { ViewChild } from '@angular/core';

/**
 * Status bar component
 */

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'elfile-statusbar',
  templateUrl: 'statusbar.html',
  styleUrls: ['statusbar.scss']
})

export class StatusbarComponent extends LifecycleComponent {

  @Input() status = { } as StatusStateModel;

  @ViewChild('ding', { static: true }) ding;

  /** ctor */
  constructor(private store: Store) {
    super();
  }

  /** Signal cancel long-running operation */
  cancel(): void {
    this.store.dispatch(new Canceled());
  }

  // bind OnChange handlers

  @OnChange('status') newState() {
    if (this.status && this.ding.nativeElement) {
      if (this.status.alarm) {
        this.ding.nativeElement
          .play()
          .then(() => this.store.dispatch(new Alarm({ alarm: false })));
      }
    }
  }

}
