import { ElectronService } from 'ngx-electron';
import { Injectable } from '@angular/core';
import { StatusMessage } from '../state/status';
import { Store } from '@ngxs/store';

const MAX_STACK = 100;

/**
 * Model a file system operation
 */

export abstract class Operation {

  redo?: Operation;
  undo?: Operation;

  private str: string;

  constructor(public async: boolean) { }

  run(fsSvc: FSService): void {
    // capture what we are about to run & run it
    this.str = this.toStringImpl(fsSvc);
    const err = this.runImpl(fsSvc);
    if (err)
      fsSvc.handleError(err);
    else {
      fsSvc.handleSuccess(this.str);
      // manage the undo/redo stack
      if (this.undo) {
        this.undo.redo = Object.create(this);
        this.undo.undo = null;
        fsSvc.pushUndo(this.undo);
      }
      else if (this.redo) {
        this.redo.redo = null;
        this.redo.undo = Object.create(this);
        fsSvc.pushRedo(this.redo);
      }
    }
  }

  abstract runImpl(fsSvc: FSService): string;

  toString(): string {
    return this.str;
  }

  abstract toStringImpl(fsSvc: FSService): string;

}

/**
 * File system service
 */

@Injectable()
export class FSService {

  fs: any;
  path: any;

  redoStack: Operation[] = [];
  undoStack: Operation[] = [];

  /** ctor */
  constructor(private electron: ElectronService,
              private store: Store) {
    this.fs = this.electron.remote.require('fs');
    this.path = this.electron.remote.require('path');
  }

  /** Can we redo? */
  canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  /** Can we undo? */
  canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  /** Handle an operation error */
  handleError(err: string): void {
    this.store.dispatch(new StatusMessage({ msgLevel: 'warn', msgText: err }));
  }

  /** Handle an operation success */
  handleSuccess(msg: string): void {
    this.store.dispatch(new StatusMessage({ msgLevel: 'info', msgText: msg }));
  }

  /** Peek at the topmost redo action */
  peekRedo(): Operation {
    return this.canRedo()? this.redoStack[this.redoStack.length - 1] : null;
  }

  /** Peek at the topmost undo action */
  peekUndo(): Operation {
    return this.canUndo()? this.undoStack[this.undoStack.length - 1] : null;
  }

  /** Push an operation onto the redo stack */
  pushRedo(op: Operation): void {
    if (this.redoStack.length === MAX_STACK)
      this.redoStack.splice(0, 1);
    this.redoStack.push(op);
  }

  /** Push an operation onto the undo stack */
  pushUndo(op: Operation): void {
    if (this.undoStack.length === MAX_STACK)
      this.undoStack.splice(0, 1);
    this.undoStack.push(op);
  }

  /** Perform redo operation */
  redo(): void {
    if (this.canRedo()) {
      const op = this.redoStack.splice(-1, 1)[0];
      this.run(op);
    }
  }

  /** Rename a file or directory */
  rename(from: string,
         to: string): string {
    try {
      this.fs.accessSync(to);
      return `${to} already exists`;
    }
    catch (err) {
      this.fs.renameSync(from, to);
      return null;
    }
  }

  /** Execute operation */
  run(op: Operation): void {
    if (op)
      op.run(this);
  }

  /** Perform undo operation */
  undo(): void {
    if (this.canUndo()) {
      const op = this.undoStack.splice(-1, 1)[0];
      this.run(op);
    }
  }

}
