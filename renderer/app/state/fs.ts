import * as Mode from 'stat-mode';
import * as fs from 'fs';
import * as path from 'path';

import { Action, NgxsOnInit, Select, State, StateContext, Store } from '@ngxs/store';
import { FSColorState, FSColorStateModel, SetColor } from './fscolor';

import { ElectronService } from 'ngx-electron';
import { Message } from './status';
import { NgZone } from '@angular/core';
import { Observable } from 'rxjs';
import async from 'async-es';
import { config } from '../config';

/** NOTE: actions must come first because of AST */

export class DirLoaded {
  static readonly type = '[FS] dir loaded';
  constructor(public readonly payload: { path: string, descs: Descriptor[] }) { }
}

export class DirUnloaded {
  static readonly type = '[FS] dir unloaded';
  constructor(public readonly payload: { path: string }) { }
}

export class ForceLoadDirs {
  static readonly type = '[FS] force load dirs';
  constructor(public readonly payload: { paths: string[] }) { }
}

export class LoadDirs {
  static readonly type = '[FS] load dirs';
  constructor(public readonly payload: { paths: string[] }) { }
}

export class UlimitExceeded {
  static readonly type = '[FS] ulimit exceeded';
  constructor(public readonly payload: { limit: number }) { }
}

export class UnloadDirs {
  static readonly type = '[FS] unload dirs';
  constructor(public readonly payload: { paths: string[] }) { }
}

export interface Descriptor {
  atime: Date;
  btime: Date;
  color: string;
  group: string;
  icon: string;
  isDirectory: boolean;
  isFile: boolean;
  isReadable: boolean;
  isSymlink: boolean;
  isWritable: boolean;
  mode: string;
  mtime: Date;
  name: string;
  path: string;
  size: number;
  user: string;
}

export interface FSStateModel {
  [path: string]: Descriptor[];
}

@State<FSStateModel>({
  name: 'fs',
  defaults: { }
}) export class FSState implements NgxsOnInit {

  @Select(FSColorState) fscolor$: Observable<FSColorStateModel>;

  fscolor = { } as FSColorStateModel;

  private fs_: typeof fs;
  private path_: typeof path;
  private userInfo_: { gid: number, uid: number, username: string };
  private watcher_: { add: Function, remove: Function, on: Function };

  /** ctor */
  constructor(private electron: ElectronService,
              private store: Store,
              private zone: NgZone) {
    this.fs_ = this.electron.remote.require('fs');
    this.path_ = this.electron.remote.require('path');
    this.watcher_ = this.electron.remote.require('filewatcher')
      ({ debounce: config.fileWatcherThrottle });
    this.userInfo_ = this.electron.remote.require('os').userInfo();
  }

  @Action(ForceLoadDirs)
  forceloaddirs(ctx: StateContext<FSStateModel>,
                action: ForceLoadDirs) {
    this.loaddirs(ctx, action, true);
  }

  @Action(LoadDirs)
  loaddirs({ dispatch, getState, patchState }: StateContext<FSStateModel>,
           { payload }: LoadDirs,
           force = false) {
    const { paths } = payload;
    paths.forEach(path => {
      const descs = getState()[path];
      if (force || !descs) {
        dispatch(new Message({ text: `Loading ${path} ...` }));
        this.fs_.readdir(path, (err, names) => {
          if (err)
            dispatch(new UnloadDirs({ paths: [path] }));
          else {
            const children = names.map(name => this.path_.join(path, name));
            async.map(children, this.fs_.lstat, (err, stats) => {
              const descs: Descriptor[] = names.reduce((acc, name, ix) => {
                const stat = stats[ix];
                if (stat
                && (stat.isDirectory() || stat.isFile() || stat.isSymbolicLink())) {
                  const desc = this.makeDescriptor(name, path, stat);
                  if (desc.isReadable)
                    acc.push(desc);
                }
                return acc;
              }, []);
              patchState({ [path]: descs });
              // start watching this directory
              this.watcher_.add(path);
              this.zone.run(() => {
                dispatch(new DirLoaded({ path, descs }));
                dispatch(new Message({ text: `${path} loaded` }));
              });
            });
          }
        });
      }
    });
  }

  @Action(UnloadDirs)
  unloaddirs({ dispatch, getState, setState }: StateContext<FSStateModel>,
             { payload }: UnloadDirs) {
    const { paths } = payload;
    const state = getState();
    paths.forEach(path => {
      const { [path]: removed, ...others } = state;
      setState(others);
      // stop watching this directory
      this.watcher_.remove(path);
      this.zone.run(() => {
        dispatch(new DirUnloaded({ path }));
      });
    });
  }

  // lifecycle methods

  ngxsOnInit({ dispatch }: StateContext<FSStateModel>) {
    this.fscolor$.subscribe((fscolor: FSColorStateModel) => this.fscolor = fscolor);
    // watch for changes
    this.watcher_.on('change', (path, stat) => {
      this.zone.run(() => {
        dispatch(stat? new ForceLoadDirs({ paths: [path] }) : new DirUnloaded({ path }));
      });
    });
    // watch out for fallback
    this.watcher_.on('fallback', function(limit) {
      this.zone.run(() => {
        const explanation = `Ran out of file handles after watching ${limit} files. Falling back to polling which uses more CPU. Run ulimit -n 10000 to increase the limit for open files`;
        dispatch(new Message({ explanation, level: 'error', text: 'ulimit exceeded' }));
      });
    });

  }

  // private methods

  private isExecutable(mode: Mode,
                       uid: number,
                       gid: number): boolean {
    return (mode.others.execute
        || ((this.userInfo_.uid === uid) && mode.owner.read)
        || ((this.userInfo_.gid === gid) && mode.group.read));
  }

  private isReadable(mode: Mode,
                     uid: number,
                     gid: number): boolean {
    return (mode.others.read
        || ((this.userInfo_.uid === uid) && mode.owner.read)
        || ((this.userInfo_.gid === gid) && mode.group.read));
  }

  private isWritable(mode: Mode,
                     uid: number,
                     gid: number): boolean {
    return (mode.others.write
        || ((this.userInfo_.uid === uid) && mode.owner.write)
        || ((this.userInfo_.gid === gid) && mode.group.write));
  }

  private makeColor(name: string,
                    stat: fs.Stats): string {
    if (stat.isDirectory())
      return 'var(--mat-deep-orange-a100)';
    else if (stat.isFile()) {
      const ix = name.lastIndexOf('.');
      if (ix <= 0)
        return 'var(--mat-blue-grey-400)';
      else {
        const ext = name.substring(ix + 1).toLowerCase();
        let color = this.fscolor[ext];
        if (!color) {
          color = config.fsColors[Math.trunc(Math.random() * config.fsColors.length)];
          this.store.dispatch(new SetColor({ ext, color }));
        }
        return color;
      }
    }
    else if (stat.isSymbolicLink())
      return 'var(--mat-brown-400)';
  }

  private makeDescriptor(name: string,
                         path: string,
                         stat: fs.Stats): Descriptor {
    const mode = new Mode(stat);
    return {
      atime: stat.atime,
      btime: stat.birthtime,
      color: this.makeColor(name, stat),
      group: String(stat.gid),
      icon: this.makeIcon(name, stat),
      isDirectory: stat.isDirectory(),
      isExecutable: this.isExecutable(mode, stat.uid, stat.gid),
      isFile: stat.isFile(),
      isReadable: this.isReadable(mode, stat.uid, stat.gid),
      isSymlink: stat.isSymbolicLink(),
      isWritable: this.isWritable(mode, stat.uid, stat.gid),
      mode: mode.toString(),
      mtime: stat.mtime,
      name: name,
      path: this.path_.join(path, name),
      size: stat.isFile()? stat.size : 0,
      user: String(stat.uid)
    } as Descriptor;
  }

  private makeIcon(name: string,
                   stat: fs.Stats): string {
    if (stat.isDirectory())
      return 'fas folder';
    else if (stat.isFile()) {
      let icon = null;
      const ix = name.lastIndexOf('.');
      if (ix <= 0)
        icon = config.fsIconByName[name.toLowerCase()];
      else {
        const ext = name.substring(ix + 1).toLowerCase();
        icon = config.fsIconByExt[ext];
      }
      return icon? icon : 'far file';
    }
    else if (stat.isSymbolicLink())
      return 'fas external-link-alt';
    else return 'far file';
  }

}
