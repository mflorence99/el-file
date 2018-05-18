import { FSState, FSStateModel } from './fs';
import { LayoutState, LayoutStateModel } from './layout';
import { PrefsState, PrefsStateModel } from './prefs';
import { ViewsState, ViewsStateModel } from './views';
import { WindowState, WindowStateModel } from './window';

export interface AppState {
  fs: FSStateModel;
  layout: LayoutStateModel;
  prefs: PrefsStateModel;
  views: ViewsStateModel;
  window: WindowStateModel;
}

export const states = [
  FSState,
  LayoutState,
  PrefsState,
  ViewsState,
  WindowState
];
