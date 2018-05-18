import { Action, State, StateContext } from '@ngxs/store';

/** NOTE: actions must come first because of AST */

export class UpdatePrefs {
  static readonly type = '[Prefs] update prefs';
  constructor(public readonly payload: PrefsStateModel) { }
}

export interface PrefsStateModel {
  dateFormat?: 'ago' | 'shortDate' | 'mediumDate' | 'longDate' | 'fullDate';
  quantityFormat?: 'abbrev' | 'number' | 'bytes';
  showGridLines?: boolean;
  showHiddenFiles?: boolean;
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
    sortDirectories: 'first',
    timeFormat: 'none'
  }
}) export class PrefsState {

  @Action(UpdatePrefs)
  updatePrefs({ getState, setState }: StateContext<PrefsStateModel>,
              { payload }: UpdatePrefs) {
    setState({ ...getState(), ...payload });
  }

}
