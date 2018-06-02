import { Action, Selector, State, StateContext } from '@ngxs/store';

import { Message } from './status';
import { pluralize } from 'ellib';

/** NOTE: actions must come first because of AST */

export class AddPathToSelection {
  static readonly type = '[Selection] add path';
  constructor(public readonly payload: { path: string }) { }
}

export class ClearSelection {
  static readonly type = '[Selection] clear';
  constructor(public readonly payload?: any) { }
}

export class RemovePathFromSelection {
  static readonly type = '[Selection] remove path';
  constructor(public readonly payload: { path: string }) { }
}

export class ReplacePathsInSelection {
  static readonly type = '[Selection] replace paths';
  constructor(public readonly payload: { paths: string[] }) { }
}

export class SelectionUpdated {
  static readonly type = '[Selection] updated';
  constructor(public readonly payload: { paths: string[] }) { }
}

export class TogglePathInSelection {
  static readonly type = '[Selection] toggle path';
  constructor(public readonly payload: { path: string }) { }
}

export interface SelectionStateModel {
  paths: string[];
}

@State<SelectionStateModel>({
  name: 'selection',
  defaults: {
    paths: [],
  }
}) export class SelectionState {

  @Selector() static getPaths(state: SelectionStateModel): string[] {
    return state.paths;
  }

  @Action(AddPathToSelection)
  addPathToSelection({ dispatch, getState, patchState }: StateContext<SelectionStateModel>,
                     { payload }: AddPathToSelection) {
    const { path } = payload;
    const state = getState();
    if (!state.paths.includes(path)) {
      const paths = state.paths.slice(0);
      paths.push(path);
      patchState({ paths });
      dispatch(new SelectionUpdated({ paths }));
    }
  }

  @Action(ClearSelection)
  clearSelection({ dispatch, patchState }: StateContext<SelectionStateModel>,
                 { payload }: ClearSelection) {
    patchState({ paths: [] });
    dispatch(new SelectionUpdated({ paths: [] }));
  }

  @Action(RemovePathFromSelection)
  removePathFromSelection({ dispatch, getState, patchState }: StateContext<SelectionStateModel>,
                          { payload }: RemovePathFromSelection) {
    const { path } = payload;
    const state = getState();
    if (state.paths.includes(path)) {
      const paths = state.paths.slice(0);
      const ix = paths.indexOf(path);
      paths.splice(ix, 1);
      patchState({ paths });
      dispatch(new SelectionUpdated({ paths }));
    }
  }

  @Action(ReplacePathsInSelection)
  replacePathsInSelection({ dispatch, patchState }: StateContext<SelectionStateModel>,
                          { payload }: ReplacePathsInSelection) {
    const { paths } = payload;
    patchState({ paths });
    dispatch(new SelectionUpdated({ paths }));
  }

  @Action(SelectionUpdated)
  selectionUpdated({ dispatch }: StateContext<SelectionStateModel>,
                   { payload }: SelectionUpdated) {
    const { paths } = payload;
    let text = '';
    if (paths.length === 1)
      text = `${paths[0]} selected`;
    else if (paths.length > 1) {
      const others = pluralize(paths.length, {
        '=1': 'one other', 'other': '# others'
      });
      text = `${paths[0]} and ${others} selected`;
    }
    dispatch(new Message({ text }));
  }

  @Action(TogglePathInSelection)
  togglePathInSelection({ dispatch, getState, patchState }: StateContext<SelectionStateModel>,
                        { payload }: TogglePathInSelection) {
    const { path } = payload;
    const state = getState();
    const paths = state.paths.slice(0);
    const ix = paths.indexOf(path);
    if (ix !== -1)
      paths.splice(ix, 1);
    else paths.push(path);
    patchState({ paths });
    dispatch(new SelectionUpdated({ paths }));
  }

}
