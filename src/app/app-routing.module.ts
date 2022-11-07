import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AboutComponent } from './modules/about/components/about/about.component';
import { AdminComponent } from './modules/admin/components/admin.component';
import { HomeComponent } from './modules/home/components/home.component';
import { LoginComponent } from './modules/login/components/login/login.component';

export const RESTO_TEST: string = 'resto-test';

const routes: Routes = [
  {
    path: 'about',
    component: AboutComponent,
    loadChildren: () =>
      import('./modules/about/about.module').then((m) => m.AboutModule),
  },
  {
    path: 'login',
    component: LoginComponent,
    loadChildren: () =>
      import('./modules/login/login.module').then((m) => m.LoginModule),
  },
  {
    path: 'restaurant',
    loadChildren: () =>
      import('./modules/restaurant/restaurant.module').then((m) => m.RestaurantModule),
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: `/${RESTO_TEST}`,
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
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }
