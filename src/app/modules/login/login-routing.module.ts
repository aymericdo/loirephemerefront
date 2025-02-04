import { Routes } from '@angular/router';
import { provideEffects } from '@ngrx/effects';
import { provideState } from '@ngrx/store';
import { LoginComponent } from 'src/app/modules/login/components/login.component';
import { RecoverComponent } from 'src/app/modules/login/components/recover/recover.component';
import { RegisterComponent } from 'src/app/modules/login/components/register/register.component';
import { SignInComponent } from 'src/app/modules/login/components/sign-in/sign-in.component';
import { LoginEffects } from 'src/app/modules/login/store/login.effects';
import { loginReducer } from 'src/app/modules/login/store/login.reducer';

export const SITE_KEY = '76928deb-ad7e-4374-bc74-540e80fa1049';

export const routes: Routes = [
  {
    path: '',
    component: LoginComponent,
    providers: [
      provideState('login', loginReducer),
      provideEffects([LoginEffects]),
    ],
    children: [{
      path: '',
      pathMatch: 'full',
      component: SignInComponent,
    }, {
      path: 'register',
      component: RegisterComponent,
    }, {
      path: 'recover',
      component: RecoverComponent,
    }],
  },
  { path: '**', redirectTo: '/page/404' },
];
