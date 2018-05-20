import { Action, State, StateContext } from '@ngxs/store';

/** NOTE: actions must come first because of AST */

export class InitView {
  static readonly type = '[Views] init view';
  constructor(public readonly payload: string) { }
}

export class RemoveView {
  static readonly type = '[Views] remove view';
  constructor(public readonly payload: string) { }
}

export class UpdateViewVisibility {
  static readonly type = '[Views] update view visibility';
  constructor(public readonly payload:
    { viewID: string, visibility: ViewVisibility, allTheSame?: boolean }) { }
}

export class UpdateViewWidths {
  static readonly type = '[Views] update view widths';
  constructor(public readonly payload: { viewID: string, widths: ViewWidths }) { }
}

export interface View {
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
    const current = getState();
    if (!current[payload])
      patchState({ [payload]: { ...current['0'] } } );
  }

  @Action(RemoveView)
  removeView({ getState, setState }: StateContext<ViewsStateModel>,
             { payload }: RemoveView) {
    const updated = { ...getState() };
    delete updated[payload];
    setState({ ...updated });
  }

  @Action(UpdateViewVisibility)
  updateViewVisibility({ getState, setState }: StateContext<ViewsStateModel>,
                       { payload }: UpdateViewVisibility) {
    const updated = { ...getState() };
    if (payload.allTheSame) {
      Object.keys(updated).forEach(viewID => {
        updated[viewID].visibility = { ...payload.visibility };
        if (viewID !== payload.viewID)
          updated[viewID].widths = { ...updated[payload.viewID].widths };
      });
    }
    else {
      updated[payload.viewID].visibility = { ...payload.visibility };
      delete updated[payload.viewID].widths;
    }
    setState({ ...updated });
  }

  @Action(UpdateViewWidths)
  updateViewWidths({ getState, setState }: StateContext<ViewsStateModel>,
                   { payload }: UpdateViewWidths) {
    const updated = { ...getState() };
    updated[payload.viewID].widths = { ...payload.widths };
    setState({ ...updated });
  }

}
