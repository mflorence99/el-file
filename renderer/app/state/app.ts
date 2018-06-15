import { ClipboardState } from './clipboard';
import { ClipboardStateModel } from './clipboard';
import { FSColorState } from './fscolor';
import { FSColorStateModel } from './fscolor';
import { FSLogState } from './fslog';
import { FSLogStateModel } from './fslog';
import { FSState } from './fs';
import { FSStateModel } from './fs';
import { LayoutState } from './layout';
import { LayoutStateModel } from './layout';
import { PrefsState } from './prefs';
import { PrefsStateModel } from './prefs';
import { SelectionState } from './selection';
import { SelectionStateModel } from './selection';
import { StatusState } from './status';
import { StatusStateModel } from './status';
import { ViewsState } from './views';
import { ViewsStateModel } from './views';
import { WindowState } from './window';
import { WindowStateModel } from './window';

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
