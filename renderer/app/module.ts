import { NgxsStoragePluginModule, StorageOption } from '@ngxs/storage-plugin';

import { BarrelModule } from './barrel';
import { ContextMenuModule } from 'ngx-contextmenu';
import { NgModule } from '@angular/core';
import { NgxsLoggerPluginModule } from '@ngxs/logger-plugin';
import { NgxsModule } from '@ngxs/store';
import { RootPageComponent } from './pages/root/page';
import { RootPageModule } from './pages/root/module';
import { TerminalService } from './services/terminal';
import { states } from './state/app';

/**
 * el-term module definition
 */

const COMPONENTS = [ ];

const MODULES = [
  BarrelModule,
  RootPageModule
];

const SERVICES = [
  TerminalService
];

@NgModule({

  bootstrap: [RootPageComponent],

  declarations: [
    ...COMPONENTS
  ],

  imports: [
    ...MODULES,
    ContextMenuModule.forRoot({
      autoFocus: true
    }),
    NgxsModule.forRoot(states),
    NgxsLoggerPluginModule.forRoot({
      collapsed: true,
      logger: console
    }),
    NgxsStoragePluginModule.forRoot({
      key: ['layout', 'tabs', 'window'],
      storage: StorageOption.LocalStorage
    })
  ],

  providers: [
    ...SERVICES
  ]

})

export class ELTermModule { }
