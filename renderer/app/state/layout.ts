import { Action, State, StateContext } from '@ngxs/store';

import { UUID } from 'angular2-uuid';

/** NOTE: actions must come first because of AST */

export class CloseSplit {
  static readonly type = '[Layout] close split';
  constructor(public readonly payload: {id: string, ix: number}) { }
}

export class MakeSplit {
  static readonly type = '[Layout] make split';
  constructor(public readonly payload:
    {id: string, ix: number, direction: 'horizontal' | 'vertical', before: boolean}) { }
}

export class Reorient {
  static readonly type = '[Layout] reorient';
  constructor(public readonly payload:
    {id: string, direction: 'horizontal' | 'vertical'}) { }
}

export class UpdateSplitSizes {
  static readonly type = '[Layout] update split sizes';
  constructor(public readonly payload: {id: string, sizes: number[]}) { }
}

export interface LayoutStateModel {
  direction?: 'horizontal' | 'vertical';
  id: string;
  root?: boolean;
  size: number;
  splits?: LayoutStateModel[];
}

@State<LayoutStateModel>({
  name: 'layout',
  defaults: LayoutState.defaultLayout()
}) export class LayoutState {

  /** Create the default layout */
  static defaultLayout(): LayoutStateModel {
    return {
      direction: 'vertical',
      id: UUID.UUID(),
      root: true,
      size: 100,
      splits: [
        {
          id: UUID.UUID(),
          size: 100
        }
      ]
    };
  }

  /** Deep find a layout by its ID */
  static findSplitByID(model: LayoutStateModel,
                       id: string): LayoutStateModel {
    if (model.id === id)
      return model;
    if (model.splits && model.splits.length) {
      for (const inner of model.splits) {
        const split = this.findSplitByID(inner, id);
        if (split)
          return split;
      }
    }
    return null;
  }

  /** Visit each split in a layout */
  static visitSplits(layout: LayoutStateModel,
                     visitor: Function): void {
    if (layout.splits && layout.splits.length) {
      for (const inner of layout.splits) {
        visitor(inner);
        this.visitSplits(inner, visitor);
      }
    }
  }

  @Action(CloseSplit)
  closeSplit({ getState, setState }: StateContext<LayoutStateModel>,
             { payload }: CloseSplit) {
    const updated = getState();
    const split = LayoutState.findSplitByID(updated, payload.id);
    if (split) {
      split.splits.splice(payload.ix, 1);
      // if we have more than one split left (or at the root level)
      // we set everyone to the same size, distributed evenly
      if (split.root || (split.splits.length > 1)) {
        const size = 100 / split.splits.length;
        split.splits.forEach(split => split.size = size);
      }
      // but if only one split left, collapse the splits
      // NOTE: the root level can't be deleted
      else {
        split.id = split.splits[0].id;
        delete split.direction;
        delete split.splits;
      }
    }
    setState({...updated});
  }

  @Action(MakeSplit)
  makeSplit({ getState, setState }: StateContext<LayoutStateModel>,
            { payload }: MakeSplit) {
    const updated = getState();
    const split = LayoutState.findSplitByID(updated, payload.id);
    if (split) {
      // making a split on the same axis is easy
      // we set everyone to the same size, distributed evenly
      if (split.direction === payload.direction) {
        const iy = payload.ix + (payload.before? 0 : 1);
        split.splits.splice(iy, 0, { id: UUID.UUID(), size: 0 });
        const size = 100 / split.splits.length;
        split.splits.forEach(split => split.size = size);
      }
      // but now we want to split in the opposite direction
      // we create a new sub-split, preserving IDs
      // we also set everyone to the same size, distributed evenly
      else {
        const splat = split.splits[payload.ix];
        splat.direction = payload.direction;
        const splatID = splat.id;
        splat.id = UUID.UUID();
        if (payload.before) {
          splat.splits = [{ id: UUID.UUID(), size: 50 },
                          { id: splatID, size: 50 }];
        }
        else {
          splat.splits = [{ id: splatID, size: 50 },
                          { id: UUID.UUID(), size: 50 }];
        }
      }
    }
    setState({...updated});
  }

  @Action(Reorient)
  reorient({ getState, setState }: StateContext<LayoutStateModel>,
           { payload }: Reorient) {
    const updated = getState();
    const split = LayoutState.findSplitByID(updated, payload.id);
    if (split)
      split.direction = payload.direction;
    setState({...updated});
  }

  @Action(UpdateSplitSizes)
  updateLayout({ getState, setState }: StateContext<LayoutStateModel>,
               { payload }: UpdateSplitSizes) {
    const updated = getState();
    const split = LayoutState.findSplitByID(updated, payload.id);
    if (split)
      payload.sizes.forEach((size, ix) => split.splits[ix].size = size);
    setState({...updated});
  }

}
