import { Routes } from '@angular/router';
import { provideEffects } from '@ngrx/effects';
import { provideState } from '@ngrx/store';
import { reducer } from 'src/app/auth/store/auth.reducer';
import { ProfileComponent } from 'src/app/modules/profile/components/profile.component';
import { ProfileEffects } from 'src/app/modules/profile/store/profile.effects';

export const routes: Routes = [
  {
    path: '',
    component: ProfileComponent,
    providers: [
      provideState('profile', reducer),
      provideEffects([ProfileEffects]),
    ],
  },
  { path: '**', redirectTo: '/page/404' },
];
