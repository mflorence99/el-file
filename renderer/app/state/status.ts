import { Action, State, StateContext } from '@ngxs/store';

/** NOTE: actions must come first because of AST */

export class Alarm {
  static readonly type = '[Status] alarm';
  constructor(public readonly payload: { alarm: boolean }) { }
}

export class StatusMessage {
  static readonly type = '[Status] message';
  constructor(public readonly payload: { msgLevel: 'info' | 'warn', msgText: string }) { }
}

export interface StatusStateModel {
  alarm: boolean;
  msgLevel: 'info' | 'warn';
  msgText: string;
}

@State<StatusStateModel>({
  name: 'status',
  defaults: {
    alarm: false,
    msgLevel: 'info',
    msgText: ''
  }
}) export class StatusState {

  @Action(Alarm)
  alarm({ patchState }: StateContext<StatusStateModel>,
        { payload }: Alarm) {
    const { alarm } = payload;
    patchState({ alarm });
  }

  @Action(StatusMessage)
  statusMessage({ patchState }: StateContext<StatusStateModel>,
                { payload }: StatusMessage) {
    const { msgLevel, msgText } = payload;
    patchState({ alarm: msgLevel === 'warn', msgLevel, msgText });
  }

}
