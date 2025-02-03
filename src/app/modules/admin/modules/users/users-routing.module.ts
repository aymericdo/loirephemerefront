import { Routes } from '@angular/router';
import { provideEffects } from '@ngrx/effects';
import { provideState } from '@ngrx/store';
import { UsersComponent } from 'src/app/modules/admin/modules/users/components/users.component';
import { UsersEffects } from 'src/app/modules/admin/modules/users/store/users.effects';
import { reducer } from 'src/app/modules/admin/modules/users/store/users.reducer';

export const routes: Routes = [
  {
    path: '',
    component: UsersComponent,
    data: { routeName: "users" },
    providers: [
      provideState('admin/users', reducer),
      provideEffects([
        UsersEffects,
      ]),
    ],
  },
  { path: '**', redirectTo: '/page/404' },
];
