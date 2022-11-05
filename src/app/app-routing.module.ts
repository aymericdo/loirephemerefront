import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuardService } from './auth/auth-guard.service';
import { AboutComponent } from './modules/about/components/about/about.component';
import { AdminComponent } from './modules/admin/components/admin/admin.component';
import { StatsComponent } from './modules/admin/components/stats/stats.component';
import { HomeComponent } from './modules/home/components/home/home.component';
import { LoginComponent } from './modules/login/components/login/login.component';
import { NewRestaurantComponent } from './modules/restaurant/components/new-restaurant/new-restaurant.component';
import { RestaurantComponent } from './modules/restaurant/components/restaurant.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
  },
  {
    path: 'about',
    component: AboutComponent,
    loadChildren: () =>
      import('./modules/about/about.module').then((m) => m.AboutModule),
  },
  {
    path: 'admin',
    redirectTo: 'admin/commands',
  },
  {
    path: 'admin/commands',
    component: AdminComponent,
    canActivate: [AuthGuardService],
    loadChildren: () =>
      import('./modules/admin/admin.module').then((m) => m.AdminModule),
  },
  {
    path: 'admin/stats',
    component: StatsComponent,
    canActivate: [AuthGuardService],
  },
  {
    path: 'login',
    component: LoginComponent,
    loadChildren: () =>
      import('./modules/login/login.module').then((m) => m.LoginModule),
  },
  {
    path: 'restaurant',
    component: RestaurantComponent,
    loadChildren: () =>
      import('./modules/restaurant/restaurant.module').then((m) => m.RestaurantModule),
    children: [
      {
        path: '/new',
        component: NewRestaurantComponent,
      }
    ]
  },
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }
