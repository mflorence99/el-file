import { Action, Actions, NgxsOnInit, State, StateContext, ofAction } from '@ngxs/store';
import { DirUnloaded, LoadDirs } from './fs';
import { InitView, RemoveView } from './views';

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

export class MoveTab {
  static readonly type = '[Layout] move tab';
  constructor(public readonly payload: { id: string, ix: number, tab: Tab }) { }
}

export class NewTab {
  static readonly type = '[Layout] new tab';
  constructor(public readonly payload: {id: string, path: string}) { }
}

export class RemoveTab {
  static readonly type = '[Layout] remove tab';
  constructor(public readonly payload: Tab) { }
}

export class Reorient {
  static readonly type = '[Layout] reorient';
  constructor(public readonly payload:
    {id: string, direction: 'horizontal' | 'vertical'}) { }
}

export class SelectTab {
  static readonly type = '[Layout] select tab';
  constructor(public readonly payload: Tab) { }
}

export class UpdateSplitSizes {
  static readonly type = '[Layout] update split sizes';
  constructor(public readonly payload: {id: string, sizes: number[]}) { }
}

export class UpdateTab {
  static readonly type = '[Layout] update tab';
  constructor(public readonly payload: any) { }
}

export interface Tab {
  color: string;
  icon: string;
  id: string;
  label: string;
  paths: string[];
  selected: boolean;
}

export interface LayoutStateModel {
  direction?: 'horizontal' | 'vertical';
  id?: string;
  root?: boolean;
  size?: number;
  splits?: LayoutStateModel[];
  tabs?: Tab[];
}

@State<LayoutStateModel>({
  name: 'layout',
  defaults: LayoutState.defaultLayout()
}) export class LayoutState implements NgxsOnInit {

  /** Create the default layout */
  static defaultLayout(): LayoutStateModel {
    return {
      direction: 'vertical',
      id: UUID.UUID(),
      root: true,
      size: 100,
      splits: [ LayoutState.defaultSplit({ size: 100 }) ]
    };
  }

  /** Create default split */
  static defaultSplit(overrides: LayoutStateModel = { }): LayoutStateModel {
    return Object.assign({
      id: UUID.UUID(),
      size: 100,
      tabs: [{
        color: 'var(--mat-grey-100)',
        icon: 'fab linux',
        id: UUID.UUID(),
        label: 'Root',
        paths: ['/'],
        selected: true
      } as Tab]
    } as LayoutStateModel, overrides);
  }

  /** Deep find a layout by its ID */
  static findSplitByID(layout: LayoutStateModel,
                       id: string): LayoutStateModel {
    if (layout.id === id)
      return layout;
    if (layout.splits && layout.splits.length) {
      for (const inner of layout.splits) {
        const split = LayoutState.findSplitByID(inner, id);
        if (split)
          return split;
      }
    }
    return null;
  }

  /** Deep find a layout's index within its parent by its ID */
  static findSplitIndexByID(layout: LayoutStateModel,
                            id: string): { id: string, ix: number } {
    if (layout.splits && layout.splits.length) {
      for (let ix = 0; ix < layout.splits.length; ix++) {
        if (layout.splits[ix].id === id)
          return { id: layout.id, ix };
      }
      for (const inner of layout.splits) {
        const { id: splitID, ix } = LayoutState.findSplitIndexByID(inner, id);
        if (ix !== -1)
          return { id: splitID, ix };
      }
    }
    return { id: layout.id, ix: -1 };
  }

  /** Deep find a tab by its ID */
  static findTabIndexByID(layout: LayoutStateModel,
                          id: string): { splitID: string, tabs: Tab[], ix: number } {
    if (layout.tabs && layout.tabs.length) {
      const ix = layout.tabs.findIndex(tab => tab.id === id);
      if (ix !== -1)
        return { splitID: layout.id, tabs: layout.tabs, ix };
    }
    if (layout.splits && layout.splits.length) {
      for (const inner of layout.splits) {
        const { splitID, tabs, ix } = LayoutState.findTabIndexByID(inner, id);
        if (ix !== -1)
          return { splitID, tabs, ix };
      }
    }
    return { splitID: layout.id, tabs: layout.tabs, ix: -1 };
  }

  /** Visit each split in a layout */
  static visitSplits(layout: LayoutStateModel,
                     visitor: Function): void {
    if (layout.splits && layout.splits.length) {
      for (const inner of layout.splits) {
        visitor(inner);
        LayoutState.visitSplits(inner, visitor);
      }
    }
  }

  /** Visit each tab in a layout */
  static visitTabs(layout: LayoutStateModel,
                   visitor: Function): void {
    if (layout.tabs && layout.tabs.length) {
      for (const tab of layout.tabs)
        visitor(tab);
    }
    if (layout.splits && layout.splits.length) {
      for (const inner of layout.splits)
        LayoutState.visitTabs(inner, visitor);
    }
  }

  /** ctor */
  constructor(private actions$: Actions) { }

  @Action(CloseSplit)
  closeSplit({ dispatch, getState, setState }: StateContext<LayoutStateModel>,
             { payload }: CloseSplit) {
    const updated = getState();
    const split = LayoutState.findSplitByID(updated, payload.id);
    if (split) {
      // remove any views first
      const splat = split.splits[payload.ix];
      LayoutState.visitTabs(splat, tab => {
        dispatch(new RemoveView(tab.id));
      });
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
        split.tabs = split.splits[0].tabs;
        delete split.direction;
        delete split.splits;
        delete split.tabs;
      }
    }
    setState({ ...updated });
  }

  @Action(MakeSplit)
  makeSplit({ dispatch, getState, setState }: StateContext<LayoutStateModel>,
            { payload }: MakeSplit) {
    const updated = getState();
    const split = LayoutState.findSplitByID(updated, payload.id);
    if (split) {
      // making a split on the same axis is easy
      // we set everyone to the same size, distributed evenly
      if (split.direction === payload.direction) {
        const iy = payload.ix + (payload.before? 0 : 1);
        split.splits.splice(iy, 0, LayoutState.defaultSplit({ size: 0 }));
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
        const splatTabs = splat.tabs;
        splat.id = UUID.UUID();
        delete splat.tabs;
        if (payload.before) {
          splat.splits = [LayoutState.defaultSplit({ size: 50 }),
                          { id: splatID, size: 50, tabs: splatTabs }];
        }
        else {
          splat.splits = [{ id: splatID, size: 50, tabs: splatTabs },
                          LayoutState.defaultSplit({ size: 50 })];
        }
      }
    }
    // initialize any new tab preferences
    LayoutState.visitTabs(updated, tab => {
      dispatch(new InitView(tab.id));
    });
    setState({ ...updated });
  }

  @Action(MoveTab)
  moveTab({ dispatch, getState, setState }: StateContext<LayoutStateModel>,
          { payload }: MoveTab) {
    const updated = getState();
    const split = LayoutState.findSplitByID(updated, payload.id);
    const { splitID, tabs, ix } = LayoutState.findTabIndexByID(updated, payload.tab.id);
    if (split && (ix !== -1)) {
      tabs.splice(ix, 1);
      if (tabs.length === 0) {
        const { id, ix: iy } = LayoutState.findSplitIndexByID(updated, splitID);
        if (iy !== -1)
          dispatch(new CloseSplit({ id, ix: iy }));
      }
      split.tabs.splice(payload.ix, 0, payload.tab);
      setState({ ...updated });
    }
  }

  @Action(NewTab)
  newTab({ dispatch, getState, setState }: StateContext<LayoutStateModel>,
         { payload }: NewTab) {
    const updated = getState();
    const split = LayoutState.findSplitByID(updated, payload.id);
    if (split && split.tabs) {
      const tab = {
        color: 'var(--mat-grey-100)',
        icon: 'fab linux',
        id: UUID.UUID(),
        label: payload.path,
        paths: [payload.path],
        selected: false
      };
      split.tabs.push(tab);
      dispatch(new InitView(tab.id));
      setState({ ...updated });
    }
  }

  @Action(RemoveTab)
  removeTab({ dispatch, getState, setState }: StateContext<LayoutStateModel>,
            { payload }: RemoveTab) {
    const updated = getState();
    const { tabs, ix } = LayoutState.findTabIndexByID(updated, payload.id);
    if ((tabs.length > 1) && (ix !== -1)) {
      const tab = tabs[ix];
      dispatch(new RemoveView(tab.id));
      tabs.splice(ix, 1);
      if (tab.selected)
        dispatch(new SelectTab(tabs[0]));
      setState({ ...updated });
    }
  }

  @Action(Reorient)
  reorient({ getState, setState }: StateContext<LayoutStateModel>,
           { payload }: Reorient) {
    const updated = getState();
    const split = LayoutState.findSplitByID(updated, payload.id);
    if (split)
      split.direction = payload.direction;
    setState({ ...updated });
  }

  @Action(SelectTab)
  selectTab({ getState, setState }: StateContext<LayoutStateModel>,
            { payload }: SelectTab) {
    const updated = getState();
    const { splitID, tabs, ix } = LayoutState.findTabIndexByID(updated, payload.id);
    if (ix !== -1) {
      const split = LayoutState.findSplitByID(updated, splitID);
      if (split) {
        split.tabs = tabs.map((tab, iy) => Object.assign({}, tab, { selected: (ix === iy) }));
        setState({ ...updated });
      }
    }
  }

  @Action(UpdateSplitSizes)
  updateSplitSizes({ getState, setState }: StateContext<LayoutStateModel>,
                   { payload }: UpdateSplitSizes) {
    const updated = getState();
    const split = LayoutState.findSplitByID(updated, payload.id);
    if (split)
      payload.sizes.forEach((size, ix) => split.splits[ix].size = size);
    setState({ ...updated });
  }

  @Action(UpdateTab)
  updateTab({ getState, setState }: StateContext<LayoutStateModel>,
            { payload }: UpdateTab) {
    const updated = getState();
    const { tabs, ix } = LayoutState.findTabIndexByID(updated, payload.id);
    if (ix !== -1) {
      Object.assign(tabs[ix], payload);
      setState({ ...updated });
    }
  }

  // lifecycle methods

  ngxsOnInit(ctx: StateContext<LayoutStateModel>) {
    // listen for directory removal
    this.actions$
      .pipe(ofAction(DirUnloaded))
      .subscribe(({ payload }) => {
        let changed = false;
        const layout = { ...ctx.getState() };
        LayoutState.visitTabs(layout, tab => {
          const ix = tab.paths.indexOf(payload);
          if (ix !== -1) {
            tab.paths.splice(ix, 1);
            changed = true;
          }
        });
        if (changed)
          ctx.setState({ ...layout });
      });
    // load initial paths and set initial prefs
    const layout = ctx.getState();
    LayoutState.visitTabs(layout, tab => {
      ctx.dispatch(new LoadDirs(tab.paths));
      ctx.dispatch(new InitView(tab.id));
    });
  }

}
