/// <reference types="@angular/localize" />

import { enableProdMode } from '@angular/core';


import { environment } from './environments/environment';

import '@hcaptcha/vanilla-hcaptcha';

import { bootstrapApplication } from '@angular/platform-browser';
import { registerLocaleData } from '@angular/common';

import { AppComponent } from './app/app.component';

import fr from '@angular/common/locales/fr';
import { appConfig } from 'src/app/app.config';

registerLocaleData(fr, 'fr');

export const APP_NAME = 'Oresto';
export const VAPID_PUBLIC_KEY = 'BKLI0usipFB5k2h5ZqMWF67Ln222rePzgMMWG-ctCgDN4DISjK_sK2PICWF3bjDFbhZTYfLS0Wc8qEqZ5paZvec';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, appConfig)
  .catch(err => console.error(err));
