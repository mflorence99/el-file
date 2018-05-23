import { FSColorState, FSColorStateModel } from './fscolor';
import { FSState, FSStateModel } from './fs';
import { LayoutState, LayoutStateModel } from './layout';
import { PrefsState, PrefsStateModel } from './prefs';
import { StatusState, StatusStateModel } from './status';
import { ViewsState, ViewsStateModel } from './views';
import { WindowState, WindowStateModel } from './window';

export interface AppState {
  fs: FSStateModel;
  fscolor: FSColorStateModel;
  layout: LayoutStateModel;
  status: StatusStateModel;
  prefs: PrefsStateModel;
  views: ViewsStateModel;
  window: WindowStateModel;
}

export const states = [
  FSState,
  FSColorState,
  LayoutState,
  PrefsState,
  StatusState,
  ViewsState,
  WindowState
];
