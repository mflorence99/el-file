import { Action, NgxsOnInit, State, StateContext } from '@ngxs/store';

import { Operation } from '../services/fs';
import { config } from '../config';

/** NOTE: actions must come first because of AST */

export class LogOperation {
  static readonly type = '[FSLog] log operation';
  constructor(public readonly payload: { op: Operation }) { }
}

export interface FSLogEntry {
  op: string;
  ts: Date;
}

export interface FSLogStateModel {
  entries: FSLogEntry[];
}

@State<FSLogStateModel>({
  name: 'fslog',
  defaults: {
    entries: []
  }
}) export class FSLogState implements NgxsOnInit {

  @Action(LogOperation)
  logOperation({ getState, patchState }: StateContext<FSLogStateModel>,
               { payload }: LogOperation) {
    const { op } = payload;
    const state = getState();
    const entries = state.entries.slice(0);
    if (entries.length > config.maxFSLogEntries)
      entries.splice(0, 1);
    entries.push({ op: op.toString(), ts: new Date() });
    patchState({ entries });
  }

  // lifecycle methods

  ngxsOnInit({ getState, patchState }: StateContext<FSLogStateModel>) {
    const state = getState();
    // NOTE: timestamps get serialized as strings
    const entries = state.entries.map((entry: FSLogEntry) => {
      return { op: entry.op, ts: new Date(entry.ts.toString()) };
    });
    patchState({ entries });
  }

}
