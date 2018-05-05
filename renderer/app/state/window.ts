import { Action, State, StateContext } from '@ngxs/store';

/** NOTE: actions must come first because of AST */

export class SetBounds {
  static readonly type = '[Window] set bounds';
  constructor(public readonly payload: { x, y, width, height }) { }
}

export class SetTitle {
  static readonly type = '[Window] set title';
  constructor(public readonly payload: string) { }
}

export interface WindowStateModel {
  bounds?: {x, y, width, height};
  title?: string;
}

@State<WindowStateModel>({
  name: 'window',
  defaults: { }
}) export class WindowState {

  @Action(SetBounds)
  showBounds({ getState, patchState }: StateContext<WindowStateModel>,
             { payload }: SetBounds) {
    patchState({ bounds: payload });
  }

  @Action(SetTitle)
  showTitle({ getState, patchState }: StateContext<WindowStateModel>,
            { payload }: SetTitle) {
    patchState({ title: payload });
  }

}
