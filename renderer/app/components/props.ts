import * as fs from 'fs';

import { ChangeDetectionStrategy } from '@angular/core';
import { Component } from '@angular/core';
import { Descriptor } from '../state/fs';
import { DictionaryService } from '../services/dictionary';
import { DrawerPanelComponent } from 'ellib';
import { ElectronService } from 'ngx-electron';
import { FormBuilder } from '@angular/forms';
import { FormGroup } from '@angular/forms';
import { Input } from '@angular/core';
import { LifecycleComponent } from 'ellib';
import { OnChange } from 'ellib';
import { PrefsStateModel } from '../state/prefs';
import { Validators } from '@angular/forms';

import { map } from 'rxjs/operators';

/**
 * Props component
 */

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'elfile-props',
  templateUrl: 'props.html',
  styleUrls: ['props.scss']
})

export class PropsComponent extends LifecycleComponent {

  @Input() desc = { } as Descriptor;
  @Input() prefs = { } as PrefsStateModel;

  propsForm: FormGroup;

  private fs_: typeof fs;

  /** ctor */
  constructor(public dictSvc: DictionaryService,
              private drawerPanel: DrawerPanelComponent,
              private electron: ElectronService,
              private formBuilder: FormBuilder) {
    super();
    this.fs_ = this.electron.remote.require('fs');
    // create prefs form controls
    this.propsForm = this.formBuilder.group({
      flags: this.formBuilder.group({
        S_IRGRP: '',
        S_IWGRP: '',
        S_IXGRP: '',
        S_IROTH: '',
        S_IWOTH: '',
        S_IXOTH: '',
        S_IRUSR: '',
        S_IWUSR: '',
        S_IXUSR: ''
      }),
      mode: '',
      name: ['', Validators.required],
      path: ''
    });
    // collapse flags into one mode number
    this.propsForm.get('flags').valueChanges
      .pipe(
        map(flags => Object.entries(flags)),
        map((entries: any[]) => {
          return entries
            .filter(entry => !!entry[1])
            .reduce((acc, entry) => {
              acc |= this.fs_.constants[entry[0]];
              return acc;
            }, 0);
        })
      ).subscribe(mode => this.propsForm.get('mode').setValue(mode));
  }

  /** Close drawer */
  close(): void {
    this.drawerPanel.close();
  }

  // bind OnChange handlers

  @OnChange('desc') patchProps(): void {
    if (this.desc) {
      this.propsForm.reset();
      this.propsForm.patchValue({
        flags: this.desc.mode? {
          S_IRGRP: this.desc.mode[4] === 'r',
          S_IWGRP: this.desc.mode[5] === 'w',
          S_IXGRP: this.desc.mode[6] === 'x',
          S_IROTH: this.desc.mode[7] === 'r',
          S_IWOTH: this.desc.mode[8] === 'w',
          S_IXOTH: this.desc.mode[9] === 'x',
          S_IRUSR: this.desc.mode[1] === 'r',
          S_IWUSR: this.desc.mode[2] === 'w',
          S_IXUSR: this.desc.mode[3] === 'x'
        } : { },
        name: this.desc.name,
        path: this.desc.path
      }, { emitEvent: false });
    }
  }

}
