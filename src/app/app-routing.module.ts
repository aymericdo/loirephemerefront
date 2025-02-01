import { Routes } from '@angular/router';
import { AuthGuardService } from 'src/app/auth/auth-guard.service';
import { AboutComponent } from 'src/app/modules/about/components/about.component';
import { AdminComponent } from 'src/app/modules/admin/components/admin.component';
import { HomeComponent } from 'src/app/modules/home/components/home.component';
import { FourOhFourComponent } from 'src/app/shared/components/four-oh-four/four-oh-four.component';

export const appRoutes: Routes = [
  {
    path: 'page',
    children: [
      {
        path: 'about',
        data: { routeName: "about" },
        loadChildren: () =>
          import('./modules/about/about-routing.module').then(m => m.routes),
      },
      {
        path: 'login',
        data: { routeName: "login" },
        loadChildren: () =>
          import('./modules/login/login-routing.module').then(m => m.routes),
      },
      {
        path: 'restaurant',
        data: { routeName: "restaurant" },
        loadChildren: () =>
          import('./modules/restaurant/restaurant-routing.module').then(m => m.routes),
      },
      {
        path: 'profile',
        canActivate: [AuthGuardService],
        data: { routeName: "profile" },
        loadChildren: () =>
          import('./modules/profile/profile-routing.module').then(m => m.routes),
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
    data: { routeName: "about", routeWithoutNavBar: true },
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
      import('./modules/admin/admin-routing.module').then(m => m.routes),
  },
  { path: '**', redirectTo: '/404' },
];
