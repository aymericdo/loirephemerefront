import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AboutComponent } from 'src/app/modules/about/components/about/about.component';
import { AdminComponent } from 'src/app/modules/admin/components/admin.component';
import { HomeComponent } from 'src/app/modules/home/components/home.component';
import { FourOhFourComponent } from 'src/app/shared/components/four-oh-four/four-oh-four.component';

export const DEMO_RESTO: string = 'demo-resto';

const routes: Routes = [
  {
    path: 'page/404',
    component: FourOhFourComponent,
  },
  {
    path: 'page/about',
    component: AboutComponent,
    loadChildren: () =>
      import('./modules/about/about.module').then((m) => m.AboutModule),
  },
  {
    path: 'page/login',
    loadChildren: () =>
      import('./modules/login/login.module').then((m) => m.LoginModule),
  },
  {
    path: 'page/restaurant',
    loadChildren: () =>
      import('./modules/restaurant/restaurant.module').then((m) => m.RestaurantModule),
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: `/${DEMO_RESTO}`,
  },
  {
    path: ':code',
    component: HomeComponent,
  },
  {
    path: ':code/admin',
    component: AdminComponent,
    loadChildren: () =>
      import('./modules/admin/admin.module').then((m) => m.AdminModule),
  },
  { path: '**', redirectTo: 'page/404' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }
