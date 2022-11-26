import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './components/login-modal/login.component';
import { SharedModule } from '../../shared/shared.module';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { LoginEffects } from './store/login.effects';
import { loginFeatureKey, reducer } from './store/login.reducer';
import { RegisterComponent } from 'src/app/modules/login/components/register/register.component';
import { SignInComponent } from 'src/app/modules/login/components/sign-in/sign-in.component';

@NgModule({
  declarations: [
    LoginComponent,
    RegisterComponent,
    SignInComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    EffectsModule.forFeature([LoginEffects]),
    StoreModule.forFeature(loginFeatureKey, reducer),
  ],
  exports: [
    SignInComponent,
    RegisterComponent,
  ]
})
export class LoginModule { }
