import { Actions, Store, ofAction } from '@ngxs/store';
import { AutoUnsubscribe, LifecycleComponent } from 'ellib';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { Dictionary, DictionaryService } from '../services/dictionary';
import { UpdateViewWidths, View, ViewUpdated, ViewWidths } from '../state/views';
import { debounceTime, filter } from 'rxjs/operators';

import { Subscription } from 'rxjs';

/**
 * Header component
 */

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'elfile-header',
  templateUrl: 'header.html',
  styleUrls: ['header.scss']
})

@AutoUnsubscribe()
export class HeaderComponent extends LifecycleComponent
                             implements OnInit {

  @Input() view = { } as View;
  @Input() viewID: string;

  dictionary: Dictionary[] = [];

  subToActions: Subscription;

  /** ctor */
  constructor(private actions$: Actions,
              private cdf: ChangeDetectorRef,
              private dictSvc: DictionaryService,
              private store: Store) {
    super();
  }

  // lifecycle methods

  ngOnInit() {
    this.subToActions = this.actions$
      .pipe(
        ofAction(ViewUpdated),
        filter((action: ViewUpdated) => action.payload.viewID === this.viewID),
        debounceTime(10),
      ).subscribe(() => {
        this.dictionary = this.dictSvc.dictionaryForView(this.view);
        this.cdf.detectChanges();
      });
  }

  // event handlers

  onSplitSizeChange(event: {gutterNum: number,
                            sizes: number[]}): void {
    const widths = this.dictionary.reduce((acc, entry, ix) => {
      acc[entry.name] = event.sizes[ix];
      return acc;
    }, { } as ViewWidths);
    this.store.dispatch(new UpdateViewWidths({ viewID: this.viewID, widths }));
  }

}
