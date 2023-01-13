import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProfileComponent } from 'src/app/modules/profile/components/profile.component';

const routes: Routes = [
  {
    path: '',
    component: ProfileComponent,
  },
  { path: '**', redirectTo: '/page/404' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProfileRoutingModule { }
