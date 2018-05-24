import { Descriptor, FSStateModel } from '../state/fs';

import { Injectable } from '@angular/core';
import { PrefsStateModel } from '../state/prefs';
import { View } from '../state/views';

/**
 * Dictionary of data
 */

export interface Dictionary {
  isDate: boolean;
  isQuantity: boolean;
  isString: boolean;
  name: string;
  showIcon: boolean;
  showMono: boolean;
  tag: string;
  width: number;
}

/**
 * Dictionary service
 */

@Injectable()
export class DictionaryService {

  /** Return the dictionary of all available fields */
  dictionary(): Dictionary[] {
    return [
      { name: 'name', tag: 'Name', isString: true, showIcon: true },
      { name: 'size', tag: 'Size', isQuantity: true },
      { name: 'mtime', tag: 'Modified', isDate: true },
      { name: 'btime', tag: 'Created', isDate: true },
      { name: 'atime', tag: 'Accessed', isDate: true },
      { name: 'mode', tag: 'Mode', isString: true, showMono: true },
      { name: 'user', tag: 'User', isString: true },
      { name: 'group', tag: 'Group', isString: true }
    ] as Dictionary[];
  }

  /** Return the dictionary for a particular view */
  dictionaryForView(view: View): Dictionary[] {
    return this.dictionary()
      .filter(entry => view.visibility && view.visibility[entry.name])
      .map(entry => {
        if (view.widths && view.widths[entry.name])
          entry.width = view.widths[entry.name];
        return entry;
      });
  }

  /** Build descriptors from nodes */
  descriptorsForView(path: string,
                     fs: FSStateModel,
                     dictionary: Dictionary[],
                     prefs: PrefsStateModel,
                     view: View): Descriptor[] {
    const descriptors = fs[path]?
      fs[path].filter(desc => prefs.showHiddenFiles || !desc.name.startsWith('.')) : [];
    return this.sort(descriptors, dictionary, prefs, view);
  }

  // private methods

  private sort(descriptors: Descriptor[],
               dictionary: Dictionary[],
               prefs: PrefsStateModel,
               view: View): Descriptor[] {
    if (['first', 'last'].includes(prefs.sortDirectories)) {
      const directories = descriptors.filter(desc => desc.isDirectory);
      const files = descriptors.filter(desc => !desc.isDirectory);
      if (prefs.sortDirectories === 'first')
        descriptors = this.sortImpl(directories, dictionary, view)
          .concat(this.sortImpl(files, dictionary, view));
      else if (prefs.sortDirectories === 'last')
        descriptors = this.sortImpl(files, dictionary, view)
          .concat(this.sortImpl(directories, dictionary, view));
    }
    else this.sortImpl(descriptors, dictionary, view);
    return descriptors;
  }

  private sortImpl(descriptors: Descriptor[],
                   dictionary: Dictionary[],
                   view: View): Descriptor[] {
    const entry = dictionary.find(dict => dict.name === view.sortColumn);
    const col = view.sortColumn;
    const dir = view.sortDir;
    return descriptors.sort((a, b) => {
      if (entry.isDate)
        return (a[col].getTime() - b[col].getTime()) * dir;
      else if (entry.isQuantity)
        return (a[col] - b[col]) * dir;
      else if (entry.isString)
        return a[col].toLowerCase().localeCompare(b[col].toLowerCase()) * dir;
      else return 0;
    });
  }

}
