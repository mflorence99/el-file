import * as Mode from 'stat-mode';

import { FSNode } from '../state/fs';
import { Injectable } from '@angular/core';

/**
 * File system model
 */

export interface Descriptor {
  atime: Date;
  btime: Date;
  color: string;
  icon: string;
  isDirectory: boolean;
  isFile: boolean;
  isSymlink: boolean;
  mode: string;
  mtime: Date;
  name: string;
  size: number;
}

/**
 * Dictionary of data
 */

@Injectable()
export class DictionaryService {

  colorByExt = { };

  /** ctor */
  constructor() {
    const colorByExt = window.localStorage.getItem('colorByExt');
    this.colorByExt = colorByExt? JSON.parse(colorByExt) : { };
  }

  /** Build descriptors from nodes */
  makeDescriptors(nodes: FSNode[]): Descriptor[] {
    return nodes.map(node => {
      return {
        atime: node.stat.atime,
        btime: node.stat.birthtime,
        color: this.makeColor(node),
        icon: this.makeIcon(node),
        isDirectory: node.stat.isDirectory(),
        isFile: node.stat.isFile(),
        isSymlink: node.stat.isSymbolicLink(),
        mode: new Mode(node.stat).toString(),
        mtime: node.stat.mtime,
        name: node.name,
        size: node.stat.size
      } as Descriptor;
    });
  }

  // private methods

  private makeColor(node: FSNode): string {
    if (node.stat.isDirectory())
      return 'var(--mat-yellow-a400)';
    else if (node.stat.isFile()) {
      const ix = node.name.lastIndexOf('.');
      if (ix <= 0)
        return 'var(--mat-blue-grey-500)';
      else {
        const ext = node.name.substring(ix + 1).toLowerCase();
        let color = this.colorByExt[ext];
        if (!color) {
          color = COLORS[Math.trunc(Math.random() * COLORS.length)];
          this.colorByExt[ext] = color;
          window.localStorage.setItem('colorByExt', JSON.stringify(this.colorByExt));
        }
        return color;
      }
    }
    else if (node.stat.isSymbolicLink())
      return 'var(--mat-brown-400)';
  }

  private makeIcon(node: FSNode): string {
    if (node.stat.isDirectory())
      return 'far folder';
    else if (node.stat.isFile()) {
      let icon = null;
      const ix = node.name.lastIndexOf('.');
      if (ix <= 0)
        icon = ICON_BY_NAME[node.name.toLowerCase()];
      else {
        const ext = node.name.substring(ix + 1).toLowerCase();
        icon = ICON_BY_EXT[ext];
      }
      return icon? icon : 'far file';
    }
    else if (node.stat.isSymbolicLink())
      return 'fas external-link-alt';
  }

}

/**
 * Available colors
 */

const COLORS = [
  'var(--mat-red-a400)',
  'var(--mat-pink-a400)',
  'var(--mat-purple-a400)',
  'var(--mat-deep-purple-a400)',
  'var(--mat-indigo-a400)',
  'var(--mat-blue-a400)',
  'var(--mat-light-blue-a400)',
  'var(--mat-cyan-a400)',
  'var(--mat-teal-a400)',
  'var(--mat-green-a400)',
  'var(--mat-light-green-a400)',
  'var(--mat-lime-a400)',
  'var(--mat-yellow-a400)',
  'var(--mat-amber-a400)',
  'var(--mat-orange-a400)',
  'var(--mat-deep-orange-a400)'
];

/**
 * Available icons
 */

const ICON_BY_EXT = {
  '3g2': 'far file-video',
  '3gp': 'far file-video',
  '7z': 'far file-archive',
  'ai': 'far file-image',
  'aif': 'far file-audio',
  'apk': 'fas cube',
  'arj': 'far file-archive',
  'asm': 'far file-code',
  'asp': 'far file-code',
  'aspx': 'far file-code',
  'avi': 'far file-video',
  'bat': 'fas microchip',
  'bin': 'fas cube',
  'bmp': 'far file-image',
  'bz': 'far file-archive',
  'bz2': 'far file-archive',
  'c': 'far file-code',
  'cbl': 'far file-code',
  'cc': 'far file-code',
  'cda': 'far file-audio',
  'cfg': 'fas cog',
  'cfm': 'far file-code',
  'cgi': 'far file-code',
  'cmd': 'fas microchip',
  'com': 'fas microchip',
  'cpp': 'far file-code',
  'cson': 'far file-code',
  'css': 'fab css3-alt',
  'csv': 'far file-excel',
  'dat': 'fas database',
  'db': 'fas database',
  'dbf': 'fas database',
  'deb': 'far file-archive',
  'dmg': 'fas cube',
  'doc': 'far file-word',
  'docx': 'far file-word',
  'exe': 'fas microchip',
  'f': 'far file-code',
  'flv': 'far file-video',
  'fnt': 'fas font',
  'fon': 'fas font',
  'for': 'far file-code',
  'fs': 'far file-code',
  'gem': 'far file-archive',
  'gif': 'far file-image',
  'go': 'far file-code',
  'gradle': 'far file-code',
  'groovy': 'far file-code',
  'gz': 'far file-archive',
  'gzip': 'far file-archive',
  'h': 'far file-code',
  'h264': 'far file-video',
  'hh': 'far file-code',
  'htm': 'fab html5',
  'html': 'fab html5',
  'ico': 'far file-image',
  'ini': 'fas cog',
  'iso': 'fas cube',
  'jar': 'far file-archive',
  'java': 'fab java',
  'jpeg': 'far file-image',
  'jpg': 'far file-image',
  'js': 'fab js',
  'json': 'far file-code',
  'jsp': 'far file-code',
  'less': 'fab less',
  'log': 'fas database',
  'lua': 'far file-code',
  'm4v': 'far file-video',
  'mak': 'far file-code',
  'md': 'far file-code',
  'mdb': 'fas database',
  'mid': 'far file-audio',
  'midi': 'far file-audio',
  'mkv': 'far file-video',
  'mov': 'far file-video',
  'mp4': 'far file-video',
  'mpa': 'far file-audio',
  'mpeg': 'far file-video',
  'mpg': 'far file-video',
  'ogg': 'far file-audio',
  'otf': 'fas font',
  'pdf': 'far file-pdf',
  'pkg': 'far file-archive',
  'pl': 'far file-code',
  'png': 'far file-image',
  'ppt': 'far file-powerpoint',
  'pptx': 'far file-powerpoint',
  'ps': 'far file-image',
  'psd': 'far file-image',
  'py': 'fab python',
  'rar': 'far file-archive',
  'rb': 'far file-code',
  'rc': 'far file-code',
  'rm': 'far file-video',
  'rpm': 'far file-archive',
  'sass': 'fab sass',
  'sav': 'fas database',
  'scss': 'fab sass',
  'sh': 'fas microchip',
  'so': 'fas database',
  'sql': 'fas database',
  'svg': 'far file-image',
  'swf': 'far file-video',
  'tar': 'far file-archive',
  'tcl': 'far file-code',
  'tif': 'far file-image',
  'tiff': 'far file-image',
  'toast': 'fas cube',
  'ts': 'far file-code',
  'ttf': 'fas font',
  'txt': 'far file-alt',
  'vb': 'far file-code',
  'vcd': 'fas cube',
  'vob': 'far file-video',
  'wav': 'far file-audio',
  'wma': 'far file-audio',
  'wmv': 'far file-video',
  'woff': 'fas font',
  'wpl': 'far file-audio',
  'wsf': 'fas microchip',
  'xhtml': 'fab html5',
  'xls': 'far file-excel',
  'xlsx': 'far file-excel',
  'xml': 'far file-code',
  'xsd': 'far file-code',
  'yaml': 'far file-code',
  'yml': 'far file-code',
  'z': 'far file-archive',
  'zip': 'far file-archive',
  'zzz': 'far file'
};

const ICON_BY_NAME = {
  '.config': 'fas cog',
  '.dockerignore': 'fab docker',
  '.gitattributes': 'fab github',
  '.gitignore': 'fab github',
  '.npmignore': 'fab node-js',
  'dockerfile': 'fab docker',
};
