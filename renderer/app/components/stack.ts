import { ChangeDetectionStrategy } from '@angular/core';
import { Component } from '@angular/core';
import { Input } from '@angular/core';
import { LifecycleComponent } from 'ellib';
import { OnChange } from 'ellib';
import { Operation } from '../services/fs';
import { PrefsStateModel } from '../state/prefs';

/**
 * Undo/redo stack component
 */

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'elfile-stack',
  templateUrl: 'stack.html',
  styleUrls: ['stack.scss']
})

export class StackComponent extends LifecycleComponent {

  @Input() prefs = { } as PrefsStateModel;
  @Input() redoStack: Operation[] = [];
  @Input() undoStack: Operation[] = [];

  zipped: Operation[][] = [];

  // bind OnChange handlers

  @OnChange('redoStack', 'undoStack') onChange() {
    this.zipped = [];
    const max = Math.max(this.redoStack.length, this.undoStack.length);
    for (let ix = 0; ix < max; ix++) {
      const redo = (ix < this.redoStack.length)? this.redoStack[ix] : null;
      const undo = (ix < this.undoStack.length)? this.undoStack[ix] : null;
      this.zipped.push([redo, undo]);
    }
    this.zipped.reverse();
  }

}
