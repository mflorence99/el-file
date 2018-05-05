import { BarrelModule } from '../barrel';
import { NgModule } from '@angular/core';
import { PaneComponent } from './pane';
import { SplittableComponent } from './splittable';

/**
 * All our components
 */

const COMPONENTS = [
  PaneComponent,
  SplittableComponent
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
