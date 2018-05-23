import { Action, State, StateContext } from '@ngxs/store';

/** NOTE: actions must come first because of AST */

export class StatusMessage {
  static readonly type = '[Status] message';
  constructor(public readonly payload: { msgLevel: 'info' | 'warn', msgText: string}) { }
}

export interface StatusStateModel {
  msgLevel?: 'info' | 'warn';
  msgText?: string;
}

@State<StatusStateModel>({
  name: 'status',
  defaults: { }
}) export class StatusState {

  @Action(StatusMessage)
  statusMessage({ patchState }: StateContext<StatusStateModel>,
                { payload }: StatusMessage) {
  const { msgLevel, msgText } = payload;
    patchState({ msgLevel, msgText });
  }

}
