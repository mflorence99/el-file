import * as fit from 'xterm/lib/addons/fit/fit';
import * as search from 'xterm/lib/addons/search/search';
import * as webLinks from 'xterm/lib/addons/webLinks/webLinks';

import { ELTermModule } from './app/module';
import { Terminal } from 'xterm';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

Terminal.applyAddon(fit);
Terminal.applyAddon(search);
Terminal.applyAddon(webLinks);

platformBrowserDynamic().bootstrapModule(ELTermModule)
  .catch(err => console.log(err));
