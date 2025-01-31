import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UsersComponent } from 'src/app/modules/admin/modules/users/components/users.component';

const routes: Routes = [
  {
    path: '',
    component: UsersComponent,
    data: { routeName: "users" },
  },
  { path: '**', redirectTo: '/page/404' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UsersRoutingModule { }
