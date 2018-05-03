import { BarrelModule } from '../../barrel';
import { ComponentsModule } from '../../components/module';
import { NgModule } from '@angular/core';
import { RootCtrlComponent } from './ctrl';
import { RootPageComponent } from './page';

/**
 * Root page module
 */

const COMPONENTS = [
  RootCtrlComponent,
  RootPageComponent
];

const MODULES = [
  BarrelModule,
  ComponentsModule
];

@NgModule({

  declarations: [
    ...COMPONENTS
  ],

  exports: [
    RootPageComponent
  ],

  imports: [
    ...MODULES
  ]

})

export class RootPageModule { }
