import { Action, Selector, State, StateContext } from '@ngxs/store';
import { nextTick, pluralize } from 'ellib';

import { StatusMessage } from './status';

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
  addPathToSelection({ dispatch, getState, setState }: StateContext<SelectionStateModel>,
                     { payload }: AddPathToSelection) {
    const { path } = payload;
    const updated = { ...getState() };
    if (!updated.paths.includes(path)) {
      updated.paths.push(path);
      setState(updated);
      // sync model
      nextTick(() => dispatch(new SelectionUpdated({ paths: updated.paths })));
    }
  }

  @Action(ClearSelection)
  clearSelection({ dispatch, patchState }: StateContext<SelectionStateModel>,
                 { payload }: ClearSelection) {
    patchState({ paths: [] });
      // sync model
      nextTick(() => dispatch(new SelectionUpdated({ paths: [] })));
  }

  @Action(RemovePathFromSelection)
  removePathFromSelection({ dispatch, getState, setState }: StateContext<SelectionStateModel>,
                          { payload }: RemovePathFromSelection) {
    const { path } = payload;
    const updated = { ...getState() };
    if (updated.paths.includes(path)) {
      const ix = updated.paths.indexOf(path);
      updated.paths.splice(ix, 1);
      setState(updated);
      // sync model
      nextTick(() => dispatch(new SelectionUpdated({ paths: updated.paths })));
    }
  }

  @Action(ReplacePathsInSelection)
  replacePathsInSelection({ dispatch, patchState }: StateContext<SelectionStateModel>,
                          { payload }: ReplacePathsInSelection) {
    const { paths } = payload;
    patchState({ paths });
      // sync model
      nextTick(() => dispatch(new SelectionUpdated({ paths })));
  }

  @Action(SelectionUpdated)
  selectionUpdated({ dispatch }: StateContext<SelectionStateModel>,
                   { payload }: SelectionUpdated) {
    const { paths } = payload;
    let msgText = '';
    if (paths.length === 1)
      msgText = `${paths[0]} selected`;
    else if (paths.length > 1) {
      const others = pluralize(paths.length, {
        '=1': 'one other', 'other': '# others'
      });
      msgText = `${paths[0]} and ${others} selected`;
    }
    dispatch(new StatusMessage({ msgLevel: 'info', msgText }));
  }

  @Action(TogglePathInSelection)
  togglePathInSelection({ dispatch, getState, setState }: StateContext<SelectionStateModel>,
                        { payload }: TogglePathInSelection) {
    const { path } = payload;
    const updated = { ...getState() };
    if (updated.paths.includes(path)) {
      const ix = updated.paths.indexOf(path);
      updated.paths.splice(ix, 1);
    }
    else updated.paths.push(path);
    setState(updated);
    // sync model
    nextTick(() => dispatch(new SelectionUpdated({ paths: updated.paths })));
  }

}
