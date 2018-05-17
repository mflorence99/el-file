import * as Mode from 'stat-mode';

import { FSNode } from '../state/fs';
import { Injectable } from '@angular/core';

/**
 * File system model
 */

export class Descriptor {

  atime: Date;
  btime: Date;
  isDirectory: boolean;
  isFile: boolean;
  isSymlink: boolean;
  mode: string;
  mtime: Date;
  name: string;
  size: number;

  constructor(node: FSNode) {
    this.atime = node.stat.atime;
    this.btime = node.stat.birthtime;
    this.isDirectory = node.stat.isDirectory();
    this.isFile = node.stat.isFile();
    this.isSymlink = node.stat.isSymbolicLink();
    this.mode = new Mode(node.stat).toString();
    this.mtime = node.stat.mtime;
    this.name = node.name;
    this.size = node.stat.size;
  }

}

/**
 * Dictionary of data
 */

@Injectable()
export class DictionaryService {

}
