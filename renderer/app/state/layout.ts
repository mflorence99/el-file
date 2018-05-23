import { Action, Actions, NgxsOnInit, State, StateContext, ofAction } from '@ngxs/store';
import { DirUnloaded, LoadDirs } from './fs';
import { InitView, RemoveView, ViewUpdated } from './views';

import { UUID } from 'angular2-uuid';
import { nextTick } from 'ellib';

/** NOTE: actions must come first because of AST */

export class CloseSplit {
  static readonly type = '[Layout] close split';
  constructor(public readonly payload: { splitID: string, ix: number }) { }
}

export class MakeSplit {
  static readonly type = '[Layout] make split';
  constructor(public readonly payload: { splitID: string, ix: number, direction: 'horizontal' | 'vertical', before: boolean }) { }
}

export class MoveTab {
  static readonly type = '[Layout] move tab';
  constructor(public readonly payload: { splitID: string, ix: number, tab: Tab }) { }
}

export class NewTab {
  static readonly type = '[Layout] new tab';
  constructor(public readonly payload: { splitID: string, path: string }) { }
}

export class RemoveTab {
  static readonly type = '[Layout] remove tab';
  constructor(public readonly payload: { tab: Tab }) { }
}

export class Reorient {
  static readonly type = '[Layout] reorient';
  constructor(public readonly payload: { splitID: string, direction: 'horizontal' | 'vertical'} ) { }
}

export class SelectTab {
  static readonly type = '[Layout] select tab';
  constructor(public readonly payload: { tab: Tab }) { }
}

export class TabsUpdated {
  static readonly type = '[Layout] tabs updated';
  constructor(public readonly payload: { splitID: string, tabs: Tab[] }) { }
}

export class TabUpdated {
  static readonly type = '[Layout] tab updated';
  constructor(public readonly payload: { tab: Tab }) { }
}

export class UpdateSplitSizes {
  static readonly type = '[Layout] update split sizes';
  constructor(public readonly payload: { splitID: string, sizes: number[] }) { }
}

export class UpdateTab {
  static readonly type = '[Layout] update tab';
  constructor(public readonly payload: { tab: Tab }) { }
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
                       splitID: string): LayoutStateModel {
    if (layout.id === splitID)
      return layout;
    if (layout.splits && layout.splits.length) {
      for (const inner of layout.splits) {
        const split = LayoutState.findSplitByID(inner, splitID);
        if (split)
          return split;
      }
    }
    return null;
  }

  /** Deep find a layout's index within its parent by its ID */
  static findSplitIndexByID(layout: LayoutStateModel,
                            splitID: string): { splitID: string, ix: number } {
    if (layout.splits && layout.splits.length) {
      for (let ix = 0; ix < layout.splits.length; ix++) {
        if (layout.splits[ix].id === splitID)
          return { splitID: layout.id, ix };
      }
      for (const inner of layout.splits) {
        const sx = LayoutState.findSplitIndexByID(inner, splitID);
        if (sx.ix !== -1)
          return { splitID: sx.splitID, ix: sx.ix };
      }
    }
    return { splitID: layout.id, ix: -1 };
  }

  /** Deep find a tab by its ID */
  static findTabIndexByID(layout: LayoutStateModel,
                          tabID: string): { splitID: string, tabs: Tab[], ix: number } {
    if (layout.tabs && layout.tabs.length) {
      const ix = layout.tabs.findIndex(tab => tab.id === tabID);
      if (ix !== -1)
        return { splitID: layout.id, tabs: layout.tabs, ix };
    }
    if (layout.splits && layout.splits.length) {
      for (const inner of layout.splits) {
        const tx = LayoutState.findTabIndexByID(inner, tabID);
        if (tx.ix !== -1)
          return { splitID: tx.splitID, tabs: tx.tabs, ix: tx.ix };
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
    const { splitID, ix } = payload;
    const updated = { ...getState() };
    const split = LayoutState.findSplitByID(updated, splitID);
    if (split) {
      // remove any views first
      const splat = split.splits[ix];
      LayoutState.visitTabs(splat, (tab: Tab) => {
        dispatch(new RemoveView({ viewID: tab.id }));
      });
      split.splits.splice(ix, 1);
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
      setState(updated);
    }
  }

  @Action(MakeSplit)
  makeSplit({ dispatch, getState, setState }: StateContext<LayoutStateModel>,
            { payload }: MakeSplit) {
    const { splitID, ix, direction, before } = payload;
    const updated = { ...getState() };
    const split = LayoutState.findSplitByID(updated, splitID);
    if (split) {
      // making a split on the same axis is easy
      // we set everyone to the same size, distributed evenly
      if (split.direction === direction) {
        const iy = ix + (before? 0 : 1);
        split.splits.splice(iy, 0, LayoutState.defaultSplit({ size: 0 }));
        const size = 100 / split.splits.length;
        split.splits.forEach(split => split.size = size);
      }
      // but now we want to split in the opposite direction
      // we create a new sub-split, preserving IDs
      // we also set everyone to the same size, distributed evenly
      else {
        const splat = split.splits[ix];
        splat.direction = direction;
        const splatID = splat.id;
        const splatTabs = splat.tabs;
        splat.id = UUID.UUID();
        delete splat.tabs;
        if (before) {
          splat.splits = [LayoutState.defaultSplit({ size: 50 }),
                          { id: splatID, size: 50, tabs: splatTabs }];
        }
        else {
          splat.splits = [{ id: splatID, size: 50, tabs: splatTabs },
                          LayoutState.defaultSplit({ size: 50 })];
        }
      }
      setState(updated);
      // initialize any new tab preferences
      LayoutState.visitTabs(updated, (tab: Tab) => {
        dispatch(new InitView({ viewID: tab.id }));
      });
    }
  }

  @Action(MoveTab)
  moveTab({ dispatch, getState, setState }: StateContext<LayoutStateModel>,
          { payload }: MoveTab) {
    const { splitID, ix, tab } = payload;
    const updated = { ...getState() };
    const split = LayoutState.findSplitByID(updated, splitID);
    if (split) {
      const tx = LayoutState.findTabIndexByID(updated, tab.id);
      if (tx.ix !== -1) {
        tx.tabs.splice(tx.ix, 1);
        // NOTE: we can only be left with zero tabs if we moved a tab from
        // another split
        if (tx.tabs.length === 0) {
          const sx = LayoutState.findSplitIndexByID(updated, tx.splitID);
          if (sx.ix !== -1)
            dispatch(new CloseSplit({ splitID: tx.splitID, ix: sx.ix }));
        }
        split.tabs.splice(ix, 0, tab);
        setState(updated);
        // sync model
        nextTick(() => {
          dispatch(new TabsUpdated({ splitID, tabs: split.tabs }));
          if (tx.splitID !== splitID)
            dispatch(new TabsUpdated({ splitID: tx.splitID, tabs: tx.tabs }));
        });
      }
    }
  }

  @Action(NewTab)
  newTab({ dispatch, getState, setState }: StateContext<LayoutStateModel>,
         { payload }: NewTab) {
    const { splitID, path } = payload;
    const updated = { ...getState() };
    const split = LayoutState.findSplitByID(updated, splitID);
    if (split && split.tabs) {
      const tab = {
        color: 'var(--mat-grey-100)',
        icon: 'fab linux',
        id: UUID.UUID(),
        label: this.makeLabelFromPath(path),
        paths: [path],
        selected: false
      };
      split.tabs.push(tab);
      setState(updated);
      // sync model
      dispatch(new InitView({ viewID: tab.id }));
      dispatch(new LoadDirs({ paths: [path] }));
      dispatch(new SelectTab({ tab }));
      // sync model
      nextTick(() => {
        dispatch(new TabUpdated({ tab }));
        // NOTE: SelectTab will issue its own TabsUpdated
      });
    }
  }

  @Action(RemoveTab)
  removeTab({ dispatch, getState, setState }: StateContext<LayoutStateModel>,
            { payload }: RemoveTab) {
    const { tab } = payload;
    const updated = getState();
    const tx = LayoutState.findTabIndexByID(updated, tab.id);
    if ((tx.tabs.length > 1) && (tx.ix !== -1)) {
      const tab = tx.tabs[tx.ix];
      tx.tabs.splice(tx.ix, 1);
      setState(updated);
      // sync model
      dispatch(new RemoveView({ viewID: tab.id }));
      if (tab.selected)
        dispatch(new SelectTab({ tab: tx.tabs[0] }));
      nextTick(() => dispatch(new TabsUpdated({ splitID: tx.splitID, tabs: tx.tabs })));
    }
  }

  @Action(Reorient)
  reorient({ getState, setState }: StateContext<LayoutStateModel>,
           { payload }: Reorient) {
    const { splitID, direction } = payload;
    const updated = { ...getState() };
    const split = LayoutState.findSplitByID(updated, splitID);
    if (split) {
      split.direction = direction;
      setState(updated);
    }
  }

  @Action(SelectTab)
  selectTab({ dispatch, getState, setState }: StateContext<LayoutStateModel>,
            { payload }: SelectTab) {
    const { tab } = payload;
    const updated = { ...getState() };
    const tx = LayoutState.findTabIndexByID(updated, tab.id);
    if (tx.ix !== -1) {
      const split = LayoutState.findSplitByID(updated, tx.splitID);
      if (split) {
        split.tabs = tx.tabs.map((tab, iy) => ({ ...tab, selected: (tx.ix === iy) }));
        setState(updated);
        // sync model
        nextTick(() => dispatch(new TabsUpdated({ splitID: tx.splitID, tabs: tx.tabs })));
      }
    }
  }

  @Action(UpdateSplitSizes)
  updateSplitSizes({ getState, setState }: StateContext<LayoutStateModel>,
                   { payload }: UpdateSplitSizes) {
    const { splitID, sizes } = payload;
    const updated = { ...getState() };
    const split = LayoutState.findSplitByID(updated, splitID);
    if (split) {
      sizes.forEach((size, ix) => split.splits[ix].size = size);
      setState(updated);
    }
  }

  @Action(UpdateTab)
  updateTab({ dispatch, getState, setState }: StateContext<LayoutStateModel>,
            { payload }: UpdateTab) {
    const { tab } = payload;
    const updated = { ...getState() };
    const tx = LayoutState.findTabIndexByID(updated, tab.id);
    if (tx.ix !== -1) {
      tx.tabs[tx.ix] = { ...tab };
      setState(updated);
      // sync model
      nextTick(() => dispatch(new TabUpdated({ tab })));
    }
  }

  // lifecycle methods

  ngxsOnInit({ dispatch, getState, setState }: StateContext<LayoutStateModel>) {
    // listen for directory removal
    this.actions$
      .pipe(ofAction(DirUnloaded))
      .subscribe(({ payload }) => {
        let changed = false;
        const layout = { ...getState() };
        LayoutState.visitTabs(layout, (tab: Tab) => {
          const ix = tab.paths.indexOf(payload);
          if (ix !== -1) {
            tab.paths.splice(ix, 1);
            changed = true;
          }
        });
        if (changed)
          setState(layout);
      });
    // load initial paths and set initial prefs
    const layout = getState();
    LayoutState.visitSplits(layout, (split: LayoutStateModel) => {
      if (split.tabs)
        nextTick(() => dispatch(new TabsUpdated({ splitID: split.id, tabs: split.tabs })));
    });
    LayoutState.visitTabs(layout, (tab: Tab) => {
      dispatch(new LoadDirs({ paths: tab.paths }));
      dispatch(new InitView({ viewID: tab.id }));
      // sync model
      nextTick(() => dispatch(new ViewUpdated({ viewID: tab.id, view: null })));
    });
  }

  // private methods

  private makeLabelFromPath(path: string): string {
    let label;
    if (path.endsWith('/'))
      label = path.substring(0, path.length - 1);
    else label = path;
    if (label.length === 0)
      label = 'Root';
    else {
      const ix = label.lastIndexOf('/');
      if (ix !== -1)
        label = label.substring(ix + 1);
    }
    return label;
  }

}
