import { ChangeDetectionStrategy } from '@angular/core';
import { Component } from '@angular/core';
import { Dictionary } from '../services/dictionary';
import { DictionaryService } from '../services/dictionary';
import { ElementRef } from '@angular/core';
import { Input } from '@angular/core';
import { LifecycleComponent } from 'ellib';
import { OnChange } from 'ellib';
import { OnDestroy } from '@angular/core';
import { OnInit } from '@angular/core';
import { PaneComponent } from './pane';
import { PrefsStateModel } from '../state/prefs';
import { Store } from '@ngxs/store';
import { UpdateViewWidths } from '../state/views';
import { View } from '../state/views';
import { ViewChild } from '@angular/core';
import { ViewWidths } from '../state/views';

/**
 * Header component
 */

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'elfile-header',
  templateUrl: 'header.html',
  styleUrls: ['header.scss']
})

export class HeaderComponent extends LifecycleComponent
                             implements OnDestroy, OnInit {

  @Input() prefs = { } as PrefsStateModel;
  @Input() view = { } as View;
  @Input() viewID: string;

  @ViewChild('outliner') outliner: ElementRef;

  dictionary: Dictionary[] = [];

  /** ctor */
  constructor(private dictSvc: DictionaryService,
              public pane: PaneComponent,
              private store: Store) {
    super();
  }

  // event handlers

  onOutlinerShow(event: {gutterNum: number,
                         sizes: number[]}): void {
    const base = this.pane.element.nativeElement;
    const ctrl = this.outliner.nativeElement;
    const box = base.getBoundingClientRect();
    let pos = 0;
    for (let ix = 0; ix < event.gutterNum; ix++)
      pos += event.sizes[ix];
    ctrl.style.left = `${box.x + ((box.width * pos) / 100)}px`;
    ctrl.style.height = `${box.height}px`;
    ctrl.style.top = `${box.y}px`;
    ctrl.style.display = 'block';
  }

  onSplitSizeChange(event: {gutterNum: number,
                            sizes: number[]}): void {
    const ctrl = this.outliner.nativeElement;
    ctrl.style.display = 'none';
    // NOTE: sanity check -- we've seen fewer split sizes that there are splits
    // @see https://github.com/mflorence99/el-file/issues/6
    if (event.sizes.length === this.dictionary.length) {
      const widths = this.dictionary.reduce((acc, entry, ix) => {
        acc[entry.name] = event.sizes[ix];
        return acc;
      }, { } as ViewWidths);
      this.store.dispatch(new UpdateViewWidths({ viewID: this.viewID, widths }));
    }
  }

  // bind OnChange handlers

  @OnChange('view') onView(): void {
    if (this.view)
      this.dictionary = this.dictSvc.dictionaryForView(this.view);
  }

  // lifecycle methods

  ngOnDestroy(): void {
    document.body.removeChild(this.outliner.nativeElement);
  }

  ngOnInit(): void {
    document.body.appendChild(this.outliner.nativeElement);
  }

}
