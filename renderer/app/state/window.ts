import { Action } from '@ngxs/store';
import { State } from '@ngxs/store';
import { StateContext } from '@ngxs/store';

/** NOTE: actions must come first because of AST */

export class SetBounds {
  static readonly type = '[Window] set bounds';
  constructor(public readonly bounds: { x, y, width, height }) { }
}

export class ShowLog {
  static readonly type = '[Window] show log';
  constructor(public readonly state: boolean) { }
}

export interface WindowStateModel {
  bounds?: {x, y, width, height};
  showLog?: boolean;
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

  @Action(ShowLog)
  showLog({ patchState }: StateContext<WindowStateModel>,
          { state }: ShowLog) {
    patchState({ showLog: state });
  }

}
