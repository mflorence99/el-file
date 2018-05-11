import { FSState, FSStateModel } from './fs';
import { LayoutState, LayoutStateModel } from './layout';
import { WindowState, WindowStateModel } from './window';

export interface AppState {
  fs: FSStateModel;
  layout: LayoutStateModel;
  window: WindowStateModel;
}

export const states = [
  FSState,
  LayoutState,
  WindowState
];
