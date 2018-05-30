import { Action, NgxsOnInit, State, StateContext } from '@ngxs/store';

import { nextTick } from 'ellib';

/** NOTE: actions must come first because of AST */

export class PrefsUpdated {
  static readonly type = '[Prefs] prefs updated';
  constructor(public readonly prefs: PrefsStateModel) { }
}

export class UpdatePrefs {
  static readonly type = '[Prefs] update prefs';
  constructor(public readonly prefs: PrefsStateModel) { }
}

export type DateFmt = 'ago' | 'shortDate' | 'mediumDate' | 'longDate' | 'fullDate';
export type QuantityFmt = 'abbrev' | 'bytes' | 'number';
export type SortOrder = 'alpha' | 'first' | 'last';
export type TimeFmt = 'none' | 'shortTime' | 'mediumTime' | 'longTime' | 'fullTime';

export interface PrefsStateModel {
  dateFormat?: DateFmt;
  quantityFormat?: QuantityFmt;
  showGridLines?: boolean;
  showHiddenFiles?: boolean;
  showOnlyWritableFiles?: boolean;
  sortDirectories?: SortOrder;
  submitted?: boolean;
  timeFormat?: TimeFmt;
}

@State<PrefsStateModel>({
  name: 'prefs',
  defaults: {
    dateFormat: 'mediumDate',
    quantityFormat: 'bytes',
    showGridLines: false,
    showHiddenFiles: false,
    showOnlyWritableFiles: false,
    sortDirectories: 'first',
    timeFormat: 'none'
  }
}) export class PrefsState implements NgxsOnInit {

  @Action(UpdatePrefs)
  updatePrefs({ dispatch, patchState }: StateContext<PrefsStateModel>,
              { prefs }: UpdatePrefs) {
    patchState({ ...prefs });
    // sync model
    nextTick(() => dispatch(new PrefsUpdated(prefs)));
  }

  // lifecycle methods

  ngxsOnInit({ dispatch, getState }: StateContext<PrefsStateModel>) {
    // sync model
    nextTick(() => dispatch(new PrefsUpdated(getState())));
  }

}
