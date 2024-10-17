import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuardService } from 'src/app/auth/auth-guard.service';
import { AboutComponent } from 'src/app/modules/about/components/about.component';
import { AdminComponent } from 'src/app/modules/admin/components/admin.component';
import { HomeComponent } from 'src/app/modules/home/components/home.component';
import { FourOhFourComponent } from 'src/app/shared/components/four-oh-four/four-oh-four.component';

const routes: Routes = [
  {
    path: 'page',
    children: [
      {
        path: 'about',
        data: { routeName: "about" },
        loadChildren: () =>
          import('./modules/about/about.module').then((m) => m.AboutModule),
      },
      {
        path: 'login',
        data: { routeName: "login" },
        loadChildren: () =>
          import('./modules/login/login.module').then((m) => m.LoginModule),
      },
      {
        path: 'restaurant',
        data: { routeName: "restaurant" },
        loadChildren: () =>
          import('./modules/restaurant/restaurant.module').then((m) => m.RestaurantModule),
      },
      {
        path: 'profile',
        canActivate: [AuthGuardService],
        data: { routeName: "profile" },
        loadChildren: () =>
          import('./modules/profile/profile.module').then((m) => m.ProfileModule),
      },
      {
        path: '404',
        component: FourOhFourComponent,
      },
    ],
  },
  {
    path: '',
    pathMatch: 'full',
    component: AboutComponent,
    data: { routeName: "about", routeWithoutNavBar: true }
  },
  {
    path: ':code',
    component: HomeComponent,
    data: { routeName: "home" },
  },
  {
    path: ':code/admin',
    component: AdminComponent,
    data: { isAdmin: true },
    loadChildren: () =>
      import('./modules/admin/admin.module').then((m) => m.AdminModule),
  },
  { path: '**', redirectTo: '/404' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }
