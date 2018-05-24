import { Action, State, StateContext } from '@ngxs/store';

import { Operation } from '../services/fs';

const MAX_STACK = 500;

/** NOTE: actions must come first because of AST */

export class LogOperation {
  static readonly type = '[FSLog] log operation';
  constructor(public readonly payload: { op: Operation }) { }
}

export interface FSLogEntry {
  op: Operation;
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
}) export class FSLogState {

  @Action(LogOperation)
  logOperation({ getState, setState }: StateContext<FSLogStateModel>,
               { payload }: LogOperation) {
    const { op } = payload;
    const updated = { ...getState() };
    if (updated.entries.length > MAX_STACK)
      updated.entries.splice(0, 1);
    updated.entries.push({ op, ts: new Date() });
    setState(updated);
  }

}
