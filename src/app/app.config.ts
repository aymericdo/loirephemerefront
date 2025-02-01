import { ApplicationConfig } from '@angular/core';
import { provideRouter, withComponentInputBinding, withViewTransitions } from '@angular/router';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { appRoutes } from 'src/app/app-routing.module';
import { DatePipe } from '@angular/common';
import { provideAnimations } from '@angular/platform-browser/animations';
import { NZ_CONFIG, NzConfig } from 'ng-zorro-antd/core/config';
import { NZ_I18N, fr_FR } from 'ng-zorro-antd/i18n';
import { AuthInterceptor } from 'src/app/auth/auth.interceptor';
import { HttpResponseInterceptor } from 'src/app/shared/services/http-response.interceptor';
import { provideEffects } from '@ngrx/effects';
import { provideStore } from '@ngrx/store';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { environment } from 'src/environments/environment';
import { provideServiceWorker } from '@angular/service-worker';
import { HomeEffects } from 'src/app/modules/home/store/home.effects';
import { LoginEffects } from 'src/app/modules/login/store/login.effects';
import { reducer as LoginReducer } from 'src/app/modules/login/store/login.reducer';
import { reducer as HomeReducer } from 'src/app/modules/home/store/home.reducer';

const ngZorroConfig: NzConfig = {
  message: { nzMaxStack: 1, nzDuration: 2000 },
};

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: NZ_I18N, useValue: fr_FR },
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: HttpResponseInterceptor, multi: true },
    { provide: NZ_CONFIG, useValue: ngZorroConfig },
    DatePipe,
    provideHttpClient(withInterceptorsFromDi()),
    provideAnimations(),
    provideRouter(
      [...appRoutes],
      withViewTransitions(),
      withComponentInputBinding(),
    ),
    provideServiceWorker(
      'ngsw-worker.js', {
        enabled: environment.production,
      },
    ),
    provideStore({
      'home': HomeReducer,
      'login': LoginReducer,
    }),
    provideEffects([
      HomeEffects,
      LoginEffects,
    ]),
    provideStoreDevtools({
      maxAge: 25,
      logOnly: environment.production,
    }),
  ],
};
