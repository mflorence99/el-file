import { BarrelModule } from '../../barrel';
import { ComponentsModule } from '../../components/module';
import { NgModule } from '@angular/core';
import { RootCtrlComponent } from './ctrl';
import { RootPageComponent } from './page';
import { StatusbarComponent } from './statusbar';
import { ToolbarComponent } from './toolbar';

/**
 * Root page module
 */

const COMPONENTS = [
  RootCtrlComponent,
  RootPageComponent,
  StatusbarComponent,
  ToolbarComponent
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
