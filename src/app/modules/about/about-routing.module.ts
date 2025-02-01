import { Routes } from '@angular/router';
import { AboutComponent } from 'src/app/modules/about/components/about.component';

export const routes: Routes = [
  {
    path: '',
    component: AboutComponent,
    data: { routeName: "about", routeWithoutNavBar: true },
  },
  { path: '**', redirectTo: '/page/404' },
];
