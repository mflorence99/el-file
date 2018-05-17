import { FSState, FSStateModel } from './fs';
import { LayoutState, LayoutStateModel } from './layout';
import { ViewsState, ViewsStateModel } from './views';
import { WindowState, WindowStateModel } from './window';

export interface AppState {
  fs: FSStateModel;
  layout: LayoutStateModel;
  views: ViewsStateModel;
  window: WindowStateModel;
}

export const states = [
  FSState,
  LayoutState,
  ViewsState,
  WindowState
];
