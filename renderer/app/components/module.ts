import { BarrelModule } from '../barrel';
import { NgModule } from '@angular/core';
import { PaneComponent } from './pane';
import { SplittableComponent } from './splittable';
import { TabsComponent } from './tabs';
import { TreeComponent } from './tree';

/**
 * All our components
 */

const COMPONENTS = [
  PaneComponent,
  SplittableComponent,
  TabsComponent,
  TreeComponent
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
