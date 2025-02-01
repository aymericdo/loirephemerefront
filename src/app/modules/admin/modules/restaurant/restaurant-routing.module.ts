import { Routes } from '@angular/router';
import { RestaurantComponent } from 'src/app/modules/admin/modules/restaurant/components/restaurant.component';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: RestaurantComponent,
    data: { routeName: "admin-restaurant" },
  },
  { path: '**', redirectTo: '/page/404' },
];
