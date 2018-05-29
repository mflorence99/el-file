import { BarrelModule } from '../barrel';
import { BranchComponent } from './branch';
import { CellComponent } from './cell';
import { ClipboardComponent } from './clipboard';
import { ColumnComponent } from './column';
import { FSLogComponent } from './fslog';
import { HeaderComponent } from './header';
import { LogComponent } from './log';
import { NgModule } from '@angular/core';
import { PaneComponent } from './pane';
import { PrefsComponent } from './prefs';
import { PropsComponent } from './props';
import { RowComponent } from './row';
import { SplittableComponent } from './splittable';
import { StackComponent } from './stack';
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
  ClipboardComponent,
  ColumnComponent,
  FSLogComponent,
  HeaderComponent,
  LogComponent,
  PaneComponent,
  PrefsComponent,
  PropsComponent,
  RowComponent,
  SplittableComponent,
  StackComponent,
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
