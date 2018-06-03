import { Action, Selector, State, StateContext } from '@ngxs/store';

/** NOTE: actions must come first because of AST */

export class Alarm {
  static readonly type = '[Status] alarm';
  constructor(public readonly payload: { alarm: boolean }) { }
}

export class Canceled {
  static readonly type = '[Status] canceled';
  constructor(public readonly payload?: any) { }
}

export class Message {
  static readonly type = '[Status] message';
  constructor(public readonly payload: { explanation?: string, level?: MessageLevel, text: string }) { }
}

export class Progress {
  static readonly type = '[Status] progress';
  constructor(public readonly payload: { path?: string, scale?: number, state?: ProgressState }) { }
}

export type MessageLevel = 'info' | 'warning' | 'error';
export type ProgressState = 'completed' | 'running' | 'scaled';

export interface StatusStateModel {
  alarm: boolean;
  message: {
    explanation?: string;
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
      explanation: '',
      level: 'info',
      text: ''
    },
    progress: {
      scale: 0,
      state: 'completed'
    }
  }
}) export class StatusState {

  @Selector() static isOpRunning(state: StatusStateModel): boolean {
    return state.progress.state === 'scaled';
  }

  @Action(Alarm)
  alarm({ patchState }: StateContext<StatusStateModel>,
        { payload }: Alarm) {
    const { alarm } = payload;
    patchState({ alarm });
  }

  @Action(Message)
  statusMessage({ patchState }: StateContext<StatusStateModel>,
                { payload }: Message) {
    const { explanation, level, text } = payload;
    patchState({ alarm: ((level === 'warning') || (level === 'error')),
                 message: { explanation: explanation || '', level: level || 'info', text } });
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
