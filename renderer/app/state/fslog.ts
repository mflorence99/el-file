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
  logOperation({ getState, setState }: StateContext<FSLogStateModel>,
               { payload }: LogOperation) {
    const { op } = payload;
    const updated = { ...getState() };
    if (updated.entries.length > config.maxFSLogEntries)
      updated.entries.splice(0, 1);
    updated.entries.push({ op: op.toString(), ts: new Date() });
    setState(updated);
  }

  // lifecycle methods

  ngxsOnInit({ getState, setState }: StateContext<FSLogStateModel>) {
    const current = { ...getState() };
    // NOTE: timestamps get serialized as strings
    current.entries.forEach((entry: FSLogEntry) => {
      entry.ts = new Date(entry.ts.toString());
    });
    setState(current);
  }

}
