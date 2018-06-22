import * as fs from 'fs';
import * as Mode from 'stat-mode';

import { Action } from '@ngxs/store';
import { ElectronService } from 'ngx-electron';
import { FSColorState } from './fscolor';
import { FSColorStateModel } from './fscolor';
import { FSService } from '../services/fs';
import { Message } from './status';
import { NgxsOnInit } from '@ngxs/store';
import { NgZone } from '@angular/core';
import { Observable } from 'rxjs';
import { Select } from '@ngxs/store';
import { SetColor } from './fscolor';
import { State } from '@ngxs/store';
import { StateContext } from '@ngxs/store';
import { Store } from '@ngxs/store';

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

  private userInfo_: { gid: number, uid: number, username: string };
  private watcher_: { add: Function, remove: Function, on: Function };

  /** ctor */
  constructor(private electron: ElectronService,
              private fsSvc: FSService,
              private store: Store,
              private zone: NgZone) {
    this.watcher_ = this.electron.remote.require('filewatcher')
      ({ debounce: config.fileWatcherThrottle });
    this.userInfo_ = this.electron.remote.require('os').userInfo();
  }

  @Action(DirLoaded)
  dirLoaded({ patchState }: StateContext<FSStateModel>,
            { payload }: DirLoaded) {
    const { path, descs } = payload;
    patchState({ [path]: descs });
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
        this.electron.ipcRenderer.send('readdir', path);
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
    this.electron.ipcRenderer.on('dirnotread', this.onDirNotRead.bind(this));
    this.electron.ipcRenderer.on('dirread', this.onDirRead.bind(this));
    this.fscolor$.subscribe((fscolor: FSColorStateModel) => this.fscolor = fscolor);
    this.watcher_.on('change', this.onWatcherChange.bind(this));
    this.watcher_.on('fallback', this.onWatcherFallback.bind(this));
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
      path: this.fsSvc.join(path, name),
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

  private onDirNotRead(event: any,
                       path: string): void {
    this.store.dispatch(new UnloadDirs({ paths: [path] }));
  }

  private onDirRead(event: any,
                    path: string,
                    contents: { [name: string]: fs.Stats }): void {
    const descs: Descriptor[] = Object.keys(contents).reduce((acc, name) => {
      const stat = contents[name];
      // NOTE: this isn't a real stat as it has been piped over IPC as JSON
      // so with some help from the main process we must reify it 
      stat.atime = new Date(stat.atime);
      stat.birthtime = new Date(stat.birthtime);
      stat.mtime = new Date(stat.mtime);
      stat.isDirectory = this._isDirectory.bind(null, stat);
      stat.isFile = this._isFile.bind(null, stat);
      stat.isSymbolicLink = this._isSymbolicLink.bind(null, stat);
      if (stat && (stat.isDirectory() || stat.isFile() || stat.isSymbolicLink())) {
        const desc = this.makeDescriptor(name, path, stat);
        if (desc.isReadable)
          acc.push(desc);
      }
      return acc;
    }, []);
    // start watching this directory
    this.watcher_.add(path);
    this.zone.run(() => {
      this.store.dispatch(new DirLoaded({ path, descs }));
      this.store.dispatch(new Message({ text: `${path} loaded` }));
    });
  }

  private onWatcherChange(path: string,
                          stat: fs.Stats): void {
    this.zone.run(() => {
      this.store.dispatch(stat?
        new ForceLoadDirs({ paths: [path] }) : new DirUnloaded({ path }));
    });
  }

  private onWatcherFallback(limit: number): void {
    this.zone.run(() => {
      const explanation = `Ran out of file handles after watching ${limit} files. Falling back to polling which uses more CPU. Run ulimit -n 10000 to increase the limit for open files`;
      this.store.dispatch(new Message({
        explanation,
        level: 'error',
        text: 'ulimit exceeded'
      }));
    });
  }

  // proxied fs.Stats methods

  private _isDirectory(stat: fs.Stats): boolean {
    return stat['_isDirectory'];
  }

  private _isFile(stat: fs.Stats): boolean {
    return stat['_isFile'];
  }

  private _isSymbolicLink(stat: fs.Stats): boolean {
    return stat['_isSymbolicLink'];
  }

}
