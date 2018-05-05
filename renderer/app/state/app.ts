import { LayoutState, LayoutStateModel } from './layout';
import { WindowState, WindowStateModel } from './window';

export interface AppState {
  layout: LayoutStateModel;
  window: WindowStateModel;
}

export const states = [
  LayoutState,
  WindowState
];
