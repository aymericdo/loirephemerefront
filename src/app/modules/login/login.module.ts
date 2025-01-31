import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { LoginEffects } from './store/login.effects';
import { loginFeatureKey, reducer } from './store/login.reducer';
import { RegisterComponent } from 'src/app/modules/login/components/register/register.component';
import { SignInComponent } from 'src/app/modules/login/components/sign-in/sign-in.component';
import { LoginComponent } from 'src/app/modules/login/components/login.component';
import { LoginRoutingModule } from 'src/app/modules/login/login-routing.module';
import { RecoverComponent } from 'src/app/modules/login/components/recover/recover.component';

export const SITE_KEY = '76928deb-ad7e-4374-bc74-540e80fa1049';

@NgModule({
  imports: [
    LoginRoutingModule,
    CommonModule,
    EffectsModule.forFeature([LoginEffects]),
    StoreModule.forFeature(loginFeatureKey, reducer),
    SignInComponent,
    RecoverComponent,
    RegisterComponent,
    LoginComponent,
],
  exports: [],
})
export class LoginModule { }
