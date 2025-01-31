import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { ProfileComponent } from 'src/app/modules/profile/components/profile.component';
import { ProfileRoutingModule } from 'src/app/modules/profile/profile-routing.module';
import { ChangePasswordComponent } from 'src/app/modules/profile/components/change-password/change-password.component';
import { ProfileEffects } from 'src/app/modules/profile/store/profile.effects';
import { profileFeatureKey, reducer } from 'src/app/modules/profile/store/profile.reducer';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';


@NgModule({
  imports: [
    ProfileRoutingModule,
    CommonModule,
    SharedModule,
    EffectsModule.forFeature([ProfileEffects]),
    StoreModule.forFeature(profileFeatureKey, reducer),
    ProfileComponent,
    ChangePasswordComponent,
  ],
})
export class ProfileModule { }
