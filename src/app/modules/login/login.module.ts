import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { LoginEffects } from './store/login.effects';
import { loginFeatureKey, reducer } from './store/login.reducer';
import { RegisterComponent } from 'src/app/modules/login/components/register/register.component';
import { SignInComponent } from 'src/app/modules/login/components/sign-in/sign-in.component';
import { LoginComponent } from 'src/app/modules/login/components/login.component';
import { LoginRoutingModule } from 'src/app/modules/login/login-routing.module';
import { ConfirmationModalComponent } from 'src/app/modules/login/components/confirmation-modal/confirmation-modal.component';
import { RecoverModalComponent } from 'src/app/modules/login/components/recover-modal/recover-modal.component';
import { RecoverComponent } from 'src/app/modules/login/components/recover/recover.component';
import { NgHcaptchaModule } from 'ng-hcaptcha';

@NgModule({
  declarations: [
    LoginComponent,
    ConfirmationModalComponent,
    RecoverComponent,
    RecoverModalComponent,
    RegisterComponent,
    SignInComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    LoginRoutingModule,
    NgHcaptchaModule.forRoot({
      siteKey: '76928deb-ad7e-4374-bc74-540e80fa1049',
    }),
    EffectsModule.forFeature([LoginEffects]),
    StoreModule.forFeature(loginFeatureKey, reducer),
  ],
  exports: [
    SignInComponent,
    RegisterComponent,
  ]
})
export class LoginModule { }
