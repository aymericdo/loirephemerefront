import { Routes } from '@angular/router';
import { UsersComponent } from 'src/app/modules/admin/modules/users/components/users.component';

export const routes: Routes = [
  {
    path: '',
    component: UsersComponent,
    data: { routeName: "users" },
  },
  { path: '**', redirectTo: '/page/404' },
];
