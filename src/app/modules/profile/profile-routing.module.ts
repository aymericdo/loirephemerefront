import { Routes } from '@angular/router';
import { provideEffects } from '@ngrx/effects';
import { provideState } from '@ngrx/store';
import { ProfileComponent } from 'src/app/modules/profile/components/profile.component';
import { ProfileEffects } from 'src/app/modules/profile/store/profile.effects';
import { profileReducer } from 'src/app/modules/profile/store/profile.reducer';

export const routes: Routes = [
  {
    path: '',
    component: ProfileComponent,
    providers: [
      provideState('profile', profileReducer),
      provideEffects([ProfileEffects]),
    ],
  },
  { path: '**', redirectTo: '/page/404' },
];
