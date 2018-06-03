import * as child_process from 'child_process';
import * as dir from 'node-dir';
import * as fs from 'fs';
import * as fsExtra from 'fs-extra';
import * as mkdirp from 'mkdirp';
import * as os from 'os';
import * as path from 'path';
import * as touch from 'touch';

import { Actions, Store, ofAction } from '@ngxs/store';
import { Canceled, Message, Progress } from '../state/status';

import { ElectronService } from 'ngx-electron';
import { Injectable } from '@angular/core';
import { LogOperation } from '../state/fslog';
import { ReplacePathsInSelection } from '../state/selection';
import async from 'async-es';
import { config } from '../config';

/**
 * Model a file system operation
 */

export abstract class Operation {

  redo?: Operation;
  undo?: Operation;

  private str: string;

  constructor(public original: boolean) { }

  run(fsSvc: FSService): OperationResult {
    // capture what we are about to run & run it
    this.str = this.toStringImpl(fsSvc);
    const result = this.runImpl(fsSvc);
    if (result)
      fsSvc.handleError(result.err);
    else {
      fsSvc.handleSuccess(this.str);
      // a new operation clears the redo stack
      // an operation w/o undo clears the undo stack
      if (this.original) {
        if (!this.undo)
          fsSvc.clearUndoStack();
        fsSvc.clearRedoStack();
      }
      // manage the undo/redo stack
      const copy = Object.assign(Object.create(this), { original: false });
      if (this.undo) {
        this.undo.redo = copy;
        this.undo.undo = null;
        fsSvc.pushUndo(this.undo);
        // NOTE: we might never execute the undo action
        // but we still want to know what it does!
        this.undo.str = this.undo.toStringImpl(fsSvc);
      }
      else if (this.redo) {
        this.redo.redo = null;
        this.redo.undo = copy;
        fsSvc.pushRedo(this.redo);
      }
    }
    return result;
  }

  abstract runImpl(fsSvc: FSService): OperationResult;

  toString(): string {
    return this.str;
  }

  abstract toStringImpl(fsSvc: FSService): string;

}

export interface OperationResult {
  err?: string;
  partial?: any[];
}

/**
 * File system service
 */

@Injectable()
export class FSService {

  private canceled: boolean;

  private child_process_: typeof child_process;
  private dir_: typeof dir;
  private fs_: typeof fs;
  private fsExtra_: typeof fsExtra;
  private mkdirp_: typeof mkdirp;
  private opener_: Function;
  private os_: typeof os;
  private path_: typeof path;
  private touch_: typeof touch;
  private trash_: Function;

  private redoStack: Operation[] = [];
  private undoStack: Operation[] = [];

  /** ctor */
  constructor(private actions$: Actions,
              private electron: ElectronService,
              private store: Store) {
    this.child_process_ = this.electron.remote.require('child_process');
    this.dir_ = this.electron.remote.require('node-dir');
    this.fs_ = this.electron.remote.require('fs');
    this.fsExtra_ = this.electron.remote.require('fs-extra');
    this.mkdirp_ = this.electron.remote.require('mkdirp');
    this.opener_ = this.electron.remote.require('opener');
    this.os_ = this.electron.remote.require('os');
    this.path_ = this.electron.remote.require('path');
    this.touch_ = this.electron.remote.require('touch');
    this.trash_ = this.electron.remote.require('trash');
    // listen for a canceled notification
    this.actions$.pipe(ofAction(Canceled))
      .subscribe(() => this.canceled = true);
  }

  /** Extract base name from path */
  basename(path: string): string {
    return this.path_.basename(path);
  }

  /** Can we redo? */
  canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  /** Can we undo? */
  canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  /** Clear the entire redo stack */
  clearRedoStack(): void {
    this.redoStack = [];
  }

  /** Clear the entire undo stack */
  clearUndoStack(): void {
    this.undoStack = [];
  }

  /** Extract directory name from path */
  dirname(path: string): string {
    return this.path_.dirname(path);
  }

  /** Does this path exist already? */
  exists(path: string): boolean {
    try {
      this.fs_.accessSync(path);
      return true;
    }
    catch (err) {
      return false;
    }
  }

  /** Extract extension from file name */
  extname(base: string): string {
    return this.path_.extname(base);
  }

  /** Handle an operation error */
  handleError(err: string): void {
    this.store.dispatch(new Message({ level: 'warn', text: err }));
  }

  /** Handle an operation success */
  handleSuccess(msg: string): void {
    this.store.dispatch(new Message({ text: msg }));
  }

  /** Get the user's home directory */
  homedir(): string {
    return this.os_.homedir();
  }

  /** Is this path readable? */
  isReadable(path: string): boolean {
    try {
      this.fs_.accessSync(path, this.fs_.constants.R_OK);
      return true;
    }
    catch (err) {
      return false;
    }
  }

  /** Is this path writable? */
  isWritable(path: string): boolean {
    try {
      this.fs_.accessSync(path, this.fs_.constants.W_OK);
      return true;
    }
    catch (err) {
      return false;
    }
  }

  /** Join names to form path */
  join(...paths: string[]): string {
    return this.path_.join(...paths);
  }

  /** Perform lstat */
  lstat(path: string): fs.Stats {
    return this.fs_.lstatSync(path);
  }

  /** Perform lstat */
  lstats(paths: string[]): fs.Stats[] {
    return paths.reduce((acc, path) => {
      acc.push(this.fs_.lstatSync(path));
      return acc;
    }, [] as fs.Stats[]);
  }

  /** Open file using default app */
  open(path: string): void {
    this.opener_(path);
  }

  /** Open file in Atom */
  openInAtom(path: string): void {
    this.child_process_.exec(`atom -a "${path}"`);
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

  /** Pop top item on the redo stack */
  popRedoStack(): Operation {
    return this.canRedo()? this.redoStack.splice(-1, 1)[0] : null;
  }

  /** Pop top item on the undo stack */
  popUndoStack(): Operation {
    return this.canUndo()? this.undoStack.splice(-1, 1)[0] : null;
  }

  /** Push an operation onto the redo stack */
  pushRedo(op: Operation): void {
    if (this.redoStack.length > config.maxRedoStackSize)
      this.redoStack.splice(0, 1);
    this.redoStack.push(op);
  }

  /** Push an operation onto the undo stack */
  pushUndo(op: Operation): void {
    if (this.undoStack.length > config.maxUndoStackSize)
      this.undoStack.splice(0, 1);
    this.undoStack.push(op);
  }

  /** Perform redo operation */
  redo(): void {
    if (this.canRedo()) {
      const op = this.popRedoStack();
      this.run(op);
    }
  }

  /** Resolve names to form path */
  resolve(...paths: string[]): string {
    return this.path_.resolve(...paths);
  }

  /** Execute operation */
  run(...ops: Operation[]): void {
    ops.forEach(op => {
      if (op) {
        const err = op.run(this);
        if (!err)
          this.store.dispatch(new LogOperation({ op }));
      }
    });
  }

  /** Perform undo operation */
  undo(): void {
    if (this.canUndo()) {
      const op = this.popUndoStack();
      this.run(op);
    }
  }

  // operations

  chmod(path: string,
        mode: number): OperationResult {
    try {
      this.fs_.chmodSync(path, mode);
      return null;
    }
    catch (err) {
      return { err: err.message };
    }
  }

  copy(froms: string[],
       tos: string[],
       doMove = false,
       opts?: any): OperationResult {
    opts = opts || { errorOnExist: true, overwrite: false, preserveTimestamps: true };
    tos = this.uniquify(tos);
    const { ifroms, itos } = this.itemize(froms, tos);
    this.canceled = false;
    async.forEachOfSeries(ifroms, (from, ix, cb) => {
      if (this.canceled)
        cb('canceled');
      else {
        const to = itos[ix];
        const scale = Math.round(((ix + 1) / ifroms.length) * 100);
        this.store.dispatch(new Progress({ path: from, scale }));
        // NOTE: we implement move as a copy+remove so it can be canceled
        this.fsExtra_.copy(from, to, opts)
          .then(() => cb())
          .catch(err => cb(err));
      }
    }, err => this.copyCompleted(froms, tos, doMove, err));
    return { partial: tos };
  }

  move(froms: string[],
       tos: string[]): OperationResult {
    return this.copy(froms, tos, true, { overwrite: false });
  }

  newDir(path: string): OperationResult {
    try {
      this.fs_.accessSync(path);
      return { err: `${path} already exists` };
    }
    catch (e1) {
      try {
        this.fs_.mkdirSync(path);
        return null;
      }
      catch (e2) {
        return { err: `${path} permission denied` };
      }
    }
  }

  newFile(path: string): OperationResult {
    try {
      this.fs_.accessSync(path);
      return { err: `${path} already exists` };
    }
    catch (e1) {
      try {
        this.touch_.sync(path, { force: true });
        return null;
      }
      catch (e2) {
        return { err: `${path} permission denied` };
      }
    }
  }

  remove(paths: string[]): OperationResult {
    async.forEachSeries(paths, (path, cb) => {
      this.fsExtra_.remove(path).then(() => cb());
    });
    return null;
  }

  rename(from: string,
         to: string): OperationResult {
    try {
      this.fs_.accessSync(to);
      return { err: `${to} already exists` };
    }
    catch (err) {
      this.fs_.renameSync(from, to);
      return null;
    }
  }

  touch(paths: string[],
        times: Date[]): OperationResult {
    const partial = [];
    try {
      for (let ix = 0; ix < paths.length; ix++) {
        const path = paths[ix];
        const time = times[ix];
        this.touch_.sync(path, { force: true, nocreate: true, time });
        partial.push(path);
      }
      return null;
    }
    catch (err) {
      return { err: err.message, partial };
    }
  }

  trash(paths: string[]): OperationResult {
    this.store.dispatch(new Progress({ state: 'running' }));
    async.forEachSeries(paths, (path, cb) => {
      this.store.dispatch(new Message({ text: path }));
      this.trash_(path).then(() => cb());
    }, () => this.store.dispatch(new Progress({ state: 'completed' })));
    // NOTE: trash has no error semantics
    return null;
  }

  // private methods

  private copyCompleted(froms: string[],
                        tos: string[],
                        doMove: boolean,
                        err: any): void {
    this.store.dispatch(new Progress({ state: 'completed' }));
    this.store.dispatch(new ReplacePathsInSelection({ paths: tos }));
    // NOTE: we implement move as a copy+remove so it can be canceled
    // NOTE: we can't undo a canceled move as it wasn't complete
    if (doMove) {
      if (err)
        this.popUndoStack();
      else this.remove(froms);
    }
  }

  private itemize(froms: string[],
                  tos: string[]): { ifroms: string[], itos: string[] } {
    let ifroms = [];
    let itos = [];
    froms.forEach((from, ix) => {
      let xfroms, xtos;
      const to = tos[ix];
      const stat = this.lstat(from);
      if (stat.isDirectory()) {
        // NOTE: we can't list the files of an empty directory -- there are none!
        // so itemization won't work -- instead, it does no harm to pre-emptively
        // create the target directory(s)
        this.mkdirp_.sync(to);
        try {
          xfroms = this.dir_.files(from, <any>{ sync: true });
          xtos = xfroms.map(path => this.path_.join(to, path.substring(from.length)));
          ifroms = ifroms.concat(xfroms);
          itos = itos.concat(xtos);
        }
        catch (err) { }
      }
      else {
        ifroms.push(from);
        itos.push(to);
      }
    });
    return { ifroms, itos };
  }

  /** Make paths unique */
  private uniquify(paths: string[]): string[] {
    const uniques = [];
    paths.forEach(path => {
      let unique = path;
      for (let ix = 0; this.exists(unique); ix++) {
        const dir = this.dirname(path);
        const base = this.basename(path);
        const ext = this.extname(base);
        const iy = base.lastIndexOf('.');
        if (iy === -1)
          unique = this.join(dir, base) + String(ix);
        else unique = this.join(dir, base.substring(0, iy)) + String(ix) + ext;
      }
      uniques.push(unique);
    });
    return uniques;
  }

}
