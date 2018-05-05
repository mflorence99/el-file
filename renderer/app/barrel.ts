import { MatButtonModule, MatButtonToggleModule, MatFormFieldModule, MatInputModule, MatTabsModule, MatTooltipModule } from '@angular/material';

import { AngularSplitModule } from 'angular-split';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { ContextMenuModule } from 'ngx-contextmenu';
import { DragDropDirectiveModule } from 'angular4-drag-drop';
import { LibModule } from 'ellib';
import { NgModule } from '@angular/core';
import { NgxElectronModule } from 'ngx-electron';
import { ReactiveFormsModule } from '@angular/forms';

/**
 * A barrel of all the modules we use everywhere
 */

const MODULES = [
  AngularSplitModule,
  BrowserModule,
  BrowserAnimationsModule,
  CommonModule,
  ContextMenuModule,
  DragDropDirectiveModule,
  LibModule,
  MatButtonModule,
  MatButtonToggleModule,
  MatFormFieldModule,
  MatInputModule,
  MatTabsModule,
  MatTooltipModule,
  NgxElectronModule,
  ReactiveFormsModule
];

@NgModule({

  imports: [
    ...MODULES
  ],

  exports: [
    ...MODULES
  ],

})

export class BarrelModule { }
