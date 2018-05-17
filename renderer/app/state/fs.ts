import * as fs from 'fs';

import { Action, NgxsOnInit, State, StateContext } from '@ngxs/store';

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

export class ForceLoadDirs {
  static readonly type = '[FS] force load dirs';
  constructor(public readonly payload: string[]) { }
}

export class LoadDirs {
  static readonly type = '[FS] load dirs';
  constructor(public readonly payload: string[]) { }
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
}) export class FSState implements NgxsOnInit {

  fs: any;
  path: any;
  watcher: any;

  /** ctor */
  constructor(private electron: ElectronService) {
    this.fs = this.electron.remote.require('fs');
    this.path = this.electron.remote.require('path');
    this.watcher = this.electron.remote.require('filewatcher')();
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
    setState({ ...updated });
    // stop watching this directory
    this.watcher.remove(payload);
  }

  @Action(ForceLoadDirs)
  forceloaddirs(ctx: StateContext<FSStateModel>,
                action: ForceLoadDirs) {
    this.loaddirs(ctx, action, true);
  }

  @Action(LoadDirs)
  loaddirs({ dispatch, getState }: StateContext<FSStateModel>,
           { payload }: LoadDirs,
           force = false) {
    payload.forEach(path => {
      const home = this.electron.process.env['HOME'];
      const dir = path.replace(/^~/, home).replace(/^\$HOME/, home);
      this.fs.readdir(dir, (err, names) => {
        if (err)
          dispatch(new DirUnloaded(dir));
        else if (force || !getState()[dir]) {
          const dirs = names.map(name => this.path.join(dir, name));
          async.map(dirs, this.fs.lstat, (err, stats) => {
            const nodes = names.reduce((acc, name, ix) => {
              acc.push({ name, stat: stats[ix] } as FSNode);
              return acc;
            }, []);
            dispatch(new DirLoaded({ path: dir, nodes }));
          });
        }
      });
    });
  }

  // lifecycle methods

  ngxsOnInit(ctx: StateContext<FSStateModel>) {
    // watch for changes
    this.watcher.on('change', (path, stat) => {
      ctx.dispatch(stat? new ForceLoadDirs([path]) : new DirUnloaded(path));
    });
    // watch out for fallback
    this.watcher.on('fallback', function(limit) {
      console.log(`Ran out of file handles after watching ${limit} files`);
      console.log('Falling back to polling which uses more CPU');
      console.log('Run ulimit -n 10000 to increase the limit for open files');
      ctx.dispatch(new UlimitExceeded(limit));
    });

  }

}
