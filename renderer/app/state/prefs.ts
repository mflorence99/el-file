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

export interface PrefsStateModel {
  dateFormat?: 'ago' | 'shortDate' | 'mediumDate' | 'longDate' | 'fullDate';
  quantityFormat?: 'abbrev' | 'bytes' | 'number';
  showGridLines?: boolean;
  showHiddenFiles?: boolean;
  showOnlyWritableFiles?: boolean;
  sortDirectories?: 'alpha' | 'first' | 'last';
  submitted?: boolean;
  timeFormat?: 'none' | 'shortTime' | 'mediumTime' | 'longTime' | 'fullTime';
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
