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

export class UpdateView {
  static readonly type = '[Views] update view';
  constructor(public readonly payload:
    { id: string, view: View, allTheSame?: boolean }) { }
}

export interface View {
  [column: string]: {
    sort?: number;
    width?: number;
  };
}

export interface ViewsStateModel {
  [id: string]: View;
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
      name: { width: 100, sort: 1 }
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

  @Action(UpdateView)
  updateView({ patchState, getState, setState }: StateContext<ViewsStateModel>,
             { payload }: UpdateView) {
    if (payload.allTheSame) {
      const updated = { ...getState() };
      Object.keys(updated).forEach(id => updated[id] = payload.view);
      setState({ ...updated });
    }
    else patchState({ [payload.id]: payload.view } );
  }

}
