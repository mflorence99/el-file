import { BarrelModule } from '../barrel';
import { BranchComponent } from './branch';
import { CellComponent } from './cell';
import { ColumnComponent } from './column';
import { HeaderComponent } from './header';
import { NgModule } from '@angular/core';
import { PaneComponent } from './pane';
import { PrefsComponent } from './prefs';
import { PropsComponent } from './props';
import { SplittableComponent } from './splittable';
import { TabComponent } from './tab';
import { TabsComponent } from './tabs';
import { TreeComponent } from './tree';
import { ViewComponent } from './view';

/**
 * All our components
 */

const COMPONENTS = [
  BranchComponent,
  CellComponent,
  ColumnComponent,
  HeaderComponent,
  PaneComponent,
  PrefsComponent,
  PropsComponent,
  SplittableComponent,
  TabComponent,
  TabsComponent,
  TreeComponent,
  ViewComponent
];

@NgModule({

  declarations: [
    ...COMPONENTS
  ],

  exports: [
    ...COMPONENTS
  ],

  imports: [
    BarrelModule
  ]

})

export class ComponentsModule { }
