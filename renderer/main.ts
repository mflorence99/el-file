import { ELFileModule } from './app/module';

import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

platformBrowserDynamic().bootstrapModule(ELFileModule)
  .catch(err => console.log(err));
