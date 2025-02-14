import { Routes } from '@angular/router';
import { provideEffects } from '@ngrx/effects';
import { provideState } from '@ngrx/store';
import { RestaurantComponent } from 'src/app/modules/admin/modules/restaurant/components/restaurant.component';
import { RestaurantEffects } from 'src/app/modules/admin/modules/restaurant/store/restaurant.effects';
import { adminRestaurantReducer } from 'src/app/modules/admin/modules/restaurant/store/restaurant.reducer';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: RestaurantComponent,
    data: { routeName: "admin-restaurant" },
    providers: [
      provideState('admin/restaurant', adminRestaurantReducer),
      provideEffects([
        RestaurantEffects,
      ]),
    ],
  },
  { path: '**', redirectTo: '/page/404' },
];
