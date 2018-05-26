import * as fs from 'fs';

import { ElectronService } from 'ngx-electron';
import { Injectable } from '@angular/core';
import { LogOperation } from '../state/fslog';
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

  run(fsSvc: FSService): string {
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
        // NOTE: we might never execute the undo action
        // but swe still want to know what it does!
        this.undo.str = this.undo.toStringImpl(fsSvc);
      }
      else if (this.redo) {
        this.redo.redo = null;
        this.redo.undo = Object.create(this);
        fsSvc.pushRedo(this.redo);
      }
    }
    return err;
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
  touch: any;

  private redoStack: Operation[] = [];
  private undoStack: Operation[] = [];

  /** ctor */
  constructor(private electron: ElectronService,
              private store: Store) {
    this.fs = this.electron.remote.require('fs');
    this.path = this.electron.remote.require('path');
    this.touch = this.electron.remote.require('touch');
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

  /** Perform lstat */
  lstat(path: string): fs.Stats {
    return this.fs.lstatSync(path);
  }

  /** Peek at the topmost redo action */
  peekRedo(): Operation {
    return this.canRedo()? this.redoStack[this.redoStack.length - 1] : null;
  }

  /** Peek at the entire redo stack */
  peekRedoStack(): Operation[] {
    return this.redoStack.slice(0);
  }

  /** Peek at the topmost undo action */
  peekUndo(): Operation {
    return this.canUndo()? this.undoStack[this.undoStack.length - 1] : null;
  }

  /** Peek at the entire undo stack */
  peekUndoStack(): Operation[] {
    return this.undoStack.slice(0);
  }

  /** Push an operation onto the redo stack */
  pushRedo(op: Operation): void {
    if (this.redoStack.length > MAX_STACK)
      this.redoStack.splice(0, 1);
    this.redoStack.push(op);
  }

  /** Push an operation onto the undo stack */
  pushUndo(op: Operation): void {
    if (this.undoStack.length > MAX_STACK)
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
    if (op) {
      const err = op.run(this);
      if (!err)
        this.store.dispatch(new LogOperation({ op }));
    }
  }

  /** Touch a file */
  touchFile(path: string,
            time: Date): string {
    try {
      this.touch.sync(path, { force: true, time });
      return null;
    }
    catch (err) {
      return err;
    }
  }

  /** Perform undo operation */
  undo(): void {
    if (this.canUndo()) {
      const op = this.undoStack.splice(-1, 1)[0];
      this.run(op);
    }
  }

}
