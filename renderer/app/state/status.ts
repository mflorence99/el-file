import { Action, State, StateContext } from '@ngxs/store';

/** NOTE: actions must come first because of AST */

export class Alarm {
  static readonly type = '[Status] alarm';
  constructor(public readonly payload: { alarm: boolean }) { }
}

export class Message {
  static readonly type = '[Status] message';
  constructor(public readonly payload: { level?: MessageLevel, text: string }) { }
}

export class Progress {
  static readonly type = '[Status] progress';
  constructor(public readonly payload: { path?: string, scale?: number, state?: ProgressState }) { }
}

export type MessageLevel = 'info' | 'warn';
export type ProgressState = 'completed' | 'running' | 'scaled';

export interface StatusStateModel {
  alarm: boolean;
  message: {
    level: MessageLevel;
    text: string;
  };
  progress: {
    scale: number;
    state: ProgressState;
  };
}

@State<StatusStateModel>({
  name: 'status',
  defaults: {
    alarm: false,
    message: {
      level: 'info',
      text: ''
    },
    progress: {
      scale: 0,
      state: 'completed'
    }
  }
}) export class StatusState {

  @Action(Alarm)
  alarm({ patchState }: StateContext<StatusStateModel>,
        { payload }: Alarm) {
    const { alarm } = payload;
    patchState({ alarm });
  }

  @Action(Message)
  statusMessage({ patchState }: StateContext<StatusStateModel>,
                { payload }: Message) {
    const { level, text } = payload;
    patchState({ alarm: level === 'warn',
                 message: { level: level? level : 'info', text } });
  }

  @Action(Progress)
  progress({ patchState }: StateContext<StatusStateModel>,
           { payload }: Progress) {
    const { path, scale, state } = payload;
    patchState({ progress: { scale: scale? scale : 0, state: state? state : 'scaled' } });
    if (path)
      patchState({  message: { level: 'info', text: path } });
  }

}
