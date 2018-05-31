import { Alarm, StatusStateModel } from '../../state/status';
import { ChangeDetectionStrategy, Component, Input, ViewChild } from '@angular/core';
import { LifecycleComponent, OnChange } from 'ellib';

import { Canceled } from '../../state/status';
import { Store } from '@ngxs/store';

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

  @ViewChild('ding') ding;

  /** ctor */
  constructor(private store: Store) {
    super();
  }

  /** Signal cancel long-running operation */
  cancel(): void {
    this.store.dispatch(new Canceled());
  }

  // bind OnChange handlers

  @OnChange('status') soundAlarm() {
    if (this.status && this.ding.nativeElement) {
      if (this.status.alarm) {
        this.ding.nativeElement
          .play()
          .then(() => this.store.dispatch(new Alarm({ alarm: false })));
      }
    }
  }

}
