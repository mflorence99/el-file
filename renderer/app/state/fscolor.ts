import { Action, State, StateContext } from '@ngxs/store';

/** NOTE: actions must come first because of AST */

export class SetColor {
  static readonly type = '[FSColor] set color';
  constructor(public readonly payload: { ext: string, color: string }) { }
}

export interface FSColorStateModel {
  [ext: string]: string;
}

@State<FSColorStateModel>({
  name: 'fscolor',
  defaults: { }
}) export class FSColorState {

  @Action(SetColor)
  setcolor({ patchState }: StateContext<FSColorStateModel>,
           { payload }: SetColor) {
    const { ext, color } = payload;
    patchState({ [ext]: color });
  }

}
