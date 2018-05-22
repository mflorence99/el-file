import { Action, State, StateContext } from '@ngxs/store';

import { nextTick } from 'ellib';

/** NOTE: actions must come first because of AST */

export class InitView {
  static readonly type = '[Views] init view';
  constructor(public readonly payload: { viewID: string }) { }
}

export class RemoveView {
  static readonly type = '[Views] remove view';
  constructor(public readonly payload: { viewID: string }) { }
}

export class UpdateViewSort {
  static readonly type = '[Views] update view sort';
  constructor(public readonly payload:
    { viewID: string, sortColumn: string, sortDir: number }) { }
}

export class UpdateViewVisibility {
  static readonly type = '[Views] update view visibility';
  constructor(public readonly payload:
    { viewID: string, visibility: ViewVisibility }) { }
}

export class UpdateViewWidths {
  static readonly type = '[Views] update view widths';
  constructor(public readonly payload: { viewID: string, widths: ViewWidths }) { }
}

export class ViewUpdated {
  static readonly type = '[Views] view updated';
  constructor(public readonly payload: { viewID: string, view: View }) { }
}

export interface View {
  sortColumn?: string;
  sortDir?: number;
  visibility?: ViewVisibility;
  widths?: ViewWidths;
}

export interface ViewVisibility {
  [column: string]: boolean;
}

export interface ViewWidths {
  [column: string]: number;
}

export interface ViewsStateModel {
  [viewID: string]: View;
}

@State<ViewsStateModel>({
  name: 'views',
  defaults: {
    // NOTE: '0' is model tab ID
    '0': ViewsState.defaultView()
  }
}) export class ViewsState {

  /** Create the default layout */
  static defaultView(): View {
    return {
      sortColumn: 'name',
      sortDir: 1,
      visibility: {
        mtime: true,
        name: true,
        size: true
      }
    };
  }

  @Action(InitView)
  initView({ getState, patchState }: StateContext<ViewsStateModel>,
           { payload }: InitView) {
    const { viewID } = payload;
    const current = getState();
    if (!current[viewID])
      patchState({ [viewID]: { ...current['0'] } } );
  }

  @Action(RemoveView)
  removeView({ getState, setState }: StateContext<ViewsStateModel>,
             { payload }: RemoveView) {
    const { viewID } = payload;
    const updated = { ...getState() };
    delete updated[viewID];
    setState(updated);
  }

  @Action(UpdateViewSort)
  updateViewSort({ dispatch, getState, patchState }: StateContext<ViewsStateModel>,
                 { payload }: UpdateViewSort) {
    const { viewID, sortColumn, sortDir } = payload;
    const current = getState()[viewID];
    const view = { ...current, sortColumn, sortDir };
    patchState({ [viewID]: view });
    // sync model
    nextTick(() => dispatch(new ViewUpdated({ viewID, view })));
  }

  @Action(UpdateViewVisibility)
  updateViewVisibility({ dispatch, getState, patchState }: StateContext<ViewsStateModel>,
                       { payload }: UpdateViewVisibility) {
    const { viewID, visibility } = payload;
    const current = getState()[viewID];
    const view = { ...current, visibility, widths: { } };
    patchState({ [viewID]: view });
    // sync model
    nextTick(() => dispatch(new ViewUpdated({ viewID, view })));
  }

  @Action(UpdateViewWidths)
  updateViewWidths({ dispatch, getState, patchState }: StateContext<ViewsStateModel>,
                   { payload }: UpdateViewWidths) {
    const { viewID, widths } = payload;
    const current = getState()[viewID];
    const view = { ...current, widths };
    patchState({ [viewID]: view });
    // sync model
    nextTick(() => dispatch(new ViewUpdated({ viewID, view })));
  }

}
