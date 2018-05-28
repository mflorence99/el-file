import { ClipboardState, ClipboardStateModel } from './clipboard';
import { FSColorState, FSColorStateModel } from './fscolor';
import { FSLogState, FSLogStateModel } from './fslog';
import { FSState, FSStateModel } from './fs';
import { LayoutState, LayoutStateModel } from './layout';
import { PrefsState, PrefsStateModel } from './prefs';
import { SelectionState, SelectionStateModel } from './selection';
import { StatusState, StatusStateModel } from './status';
import { ViewsState, ViewsStateModel } from './views';
import { WindowState, WindowStateModel } from './window';

export interface AppState {
  clipboard: ClipboardStateModel;
  fs: FSStateModel;
  fscolor: FSColorStateModel;
  fslog: FSLogStateModel;
  layout: LayoutStateModel;
  selection: SelectionStateModel;
  status: StatusStateModel;
  prefs: PrefsStateModel;
  views: ViewsStateModel;
  window: WindowStateModel;
}

export const states = [
  ClipboardState,
  FSState,
  FSColorState,
  FSLogState,
  LayoutState,
  PrefsState,
  SelectionState,
  StatusState,
  ViewsState,
  WindowState
];
