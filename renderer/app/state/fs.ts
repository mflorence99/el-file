import * as fs from 'fs';

import { Action, State, StateContext, Store } from '@ngxs/store';

import { ElectronService } from 'ngx-electron';
import async from 'async-es';

/** NOTE: actions must come first because of AST */

export class DirLoaded {
  static readonly type = '[FS] dir loaded';
  constructor(public readonly payload: {path: string, nodes: FSNode[]}) { }
}

export class DirUnloaded {
  static readonly type = '[FS] dir unloaded';
  constructor(public readonly payload: string) { }
}

export class LoadDir {
  static readonly type = '[FS] load dir';
  constructor(public readonly payload: string) { }
}

export class UlimitExceeded {
  static readonly type = '[FS] ulimit exceeded';
  constructor(public readonly payload: number) { }
}

export interface FSNode {
  name: string;
  stat: fs.Stats;
}

export interface FSStateModel {
  [path: string]: FSNode[];
}

@State<FSStateModel>({
  name: 'fs',
  defaults: { }
}) export class FSState {

  fs: any;
  watcher: any;

  /** ctor */
  constructor(private electron: ElectronService,
              private store: Store) {
    this.fs = this.electron.remote.require('fs');
    this.watcher = this.electron.remote.require('filewatcher')();
    // watch for changes
    this.watcher.on('change', (path, stat) => {
      this.store.dispatch(stat? new LoadDir(path) : new DirUnloaded(path));
    });
    // watch out for fallback
    this.watcher.on('fallback', function(limit) {
      console.log(`Ran out of file handles after watching ${limit} files`);
      console.log('Falling back to polling which uses more CPU');
      console.log('Run ulimit -n 10000 to increase the limit for open files');
      this.store.dispatch(new UlimitExceeded(limit));
    });
  }

  @Action(DirLoaded)
  dirloaded({ patchState }: StateContext<FSStateModel>,
            { payload }: DirLoaded) {
    patchState({ [payload.path]: payload.nodes });
    // start watching this directory
    this.watcher.add(payload.path);
  }

  @Action(DirUnloaded)
  dirunloaded({ getState, setState }: StateContext<FSStateModel>,
              { payload }: DirUnloaded) {
    const updated = { ...getState() };
    delete updated[payload];
    setState({...updated});
    // stop watching this directory
    this.watcher.remove(payload);
  }

  @Action(LoadDir)
  loaddir({ dispatch }: StateContext<FSStateModel>,
          { payload }: LoadDir) {
    this.fs.readdir(payload, (err, names) => {
      if (err)
        dispatch(new DirUnloaded(payload));
      else {
        const paths = names.map(name => `${payload}${name}`);
        async.map(paths, this.fs.stat, (err, stats) => {
          const nodes = names.reduce((acc, name, ix) => {
            acc.push({ name, stat: stats[ix] } as FSNode);
            return acc;
          }, []);
          dispatch(new DirLoaded({ path: payload, nodes }));
        });
      }
    });
  }

}
