import { Action } from '@ngxs/store';
import { State } from '@ngxs/store';
import { StateContext } from '@ngxs/store';

/** NOTE: actions must come first because of AST */

export class InitView {
  static readonly type = '[Views] init view';
  constructor(public readonly payload: { viewID: string }) { }
}

export class RemoveView {
  static readonly type = '[Views] remove view';
  constructor(public readonly payload: { viewID: string }) { }
}

export class UpdateView {
  static readonly type = '[Views] update view';
  constructor(public readonly payload: { viewID: string, view: View }) { }
}

export class UpdateViewSort {
  static readonly type = '[Views] update view sort';
  constructor(public readonly payload: { viewID: string, sortColumn: string, sortDir: number }) { }
}

export class UpdateViewVisibility {
  static readonly type = '[Views] update view visibility';
  constructor(public readonly payload: { viewID: string, visibility: ViewVisibility, allTheSame?: boolean }) { }
}

export class UpdateViewWidths {
  static readonly type = '[Views] update view widths';
  constructor(public readonly payload: { viewID: string, widths: ViewWidths }) { }
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
      widths: {
        name: 62.365591397849464,
        size: 11.163820366856426,
        mtime: 12.895319418089818,
        mode: 13.5752688172043
      },
      visibility: {
        mode: true,
        mtime: true,
        name: true,
        size: true
      }
    };
  }

  @Action(InitView)
  initView({ dispatch, getState, patchState }: StateContext<ViewsStateModel>,
           { payload }: InitView) {
    const { viewID } = payload;
    const state = getState();
    if (!state[viewID])
      patchState({ [viewID]: { ...state['0'] } } );
  }

  @Action(RemoveView)
  removeView({ getState, setState }: StateContext<ViewsStateModel>,
             { payload }: RemoveView) {
    const { viewID } = payload;
    const state = getState();
    const { [viewID]: removed, ...others } = state;
    setState(others);
  }

  @Action(UpdateView)
  updateView({ dispatch, patchState }: StateContext<ViewsStateModel>,
             { payload }: UpdateView) {
    const { viewID, view } = payload;
    patchState({ [viewID]: { ... view } });
  }

  @Action(UpdateViewSort)
  updateViewSort({ dispatch, getState, patchState }: StateContext<ViewsStateModel>,
                 { payload }: UpdateViewSort) {
    const { viewID, sortColumn, sortDir } = payload;
    const view = getState()[viewID];
    patchState({ [viewID]: { ...view, sortColumn, sortDir } });
  }

  @Action(UpdateViewVisibility)
  updateViewVisibility({ dispatch, getState, patchState }: StateContext<ViewsStateModel>,
                       { payload }: UpdateViewVisibility) {
    const { viewID, visibility, allTheSame } = payload;
    const view = getState()[viewID];
    // NOTE: if the visibility flags haven't changed, then we don't need
    // to zero out the widths
    const updated = this.isSame(visibility, view.visibility)?
      { ...view, visibility } : { ...view, visibility, widths: { } };
    patchState({ [viewID]: updated });
    // make all the same?
    if (allTheSame) {
      Object.keys(getState())
        .filter(key => key !== viewID)
        .forEach(viewID => {
          dispatch(new UpdateView({ viewID, view: updated }));
        });
    }
  }

  @Action(UpdateViewWidths)
  updateViewWidths({ dispatch, getState, patchState }: StateContext<ViewsStateModel>,
                   { payload }: UpdateViewWidths) {
    const { viewID, widths } = payload;
    const state = getState()[viewID];
    patchState({ [viewID]: { ...state, widths } });
  }

  // private methods

  private isSame(a, b): boolean {
    const a_keys = Object.keys(a).sort();
    const b_keys = Object.keys(b).sort();
    if ((a_keys.length !== b_keys.length))
      return false;
    for (let ix = 0; ix < a_keys.length; ix++) {
      const a_key = a_keys[ix];
      const b_key = b_keys[ix];
      if ((a_key !== b_key) || (a[a_key] !== b[b_key]))
        return false;
    }
    return true;
  }

}
