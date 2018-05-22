import { Action, State, StateContext } from '@ngxs/store';

/** NOTE: actions must come first because of AST */

export class SetBounds {
  static readonly type = '[Window] set bounds';
  constructor(public readonly bounds: { x, y, width, height }) { }
}

export interface WindowStateModel {
  bounds?: {x, y, width, height};
}

@State<WindowStateModel>({
  name: 'window',
  defaults: { }
}) export class WindowState {

  @Action(SetBounds)
  setBounds({ patchState }: StateContext<WindowStateModel>,
            { bounds }: SetBounds) {
    patchState({ bounds });
  }

}
