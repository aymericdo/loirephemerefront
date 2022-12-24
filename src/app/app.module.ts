import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SharedModule } from './shared/shared.module';
import { NZ_I18N } from 'ng-zorro-antd/i18n';
import { fr_FR } from 'ng-zorro-antd/i18n';
import { DatePipe, registerLocaleData } from '@angular/common';
import fr from '@angular/common/locales/fr';
import { ServiceWorkerModule } from '@angular/service-worker';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HomeModule } from './modules/home/home.module';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { environment } from '../environments/environment';
import { RouterModule } from '@angular/router';
import { FourOhFourComponent } from './shared/components/four-oh-four/four-oh-four.component';
import { AuthInterceptor } from 'src/app/auth/auth.interceptor';
import { HttpResponseInterceptor } from 'src/app/shared/services/http-response.interceptor';
import { NZ_CONFIG, NzConfig } from 'ng-zorro-antd/core/config';
import { LoginModule } from 'src/app/modules/login/login.module';

registerLocaleData(fr, 'fr');

const ngZorroConfig: NzConfig = {
  message: { nzMaxStack: 1, nzDuration: 2000 },
};

@NgModule({
  declarations: [AppComponent, FourOhFourComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    RouterModule,
    SharedModule,
    HomeModule,
    LoginModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production,
    }),
    StoreModule.forRoot({}, {}),
    EffectsModule.forRoot([]),
    StoreDevtoolsModule.instrument({
      maxAge: 25,
      logOnly: environment.production,
    }),
  ],
  providers: [
    { provide: NZ_I18N, useValue: fr_FR },
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: HttpResponseInterceptor, multi: true },
    { provide: NZ_CONFIG, useValue: ngZorroConfig },
    DatePipe,
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
