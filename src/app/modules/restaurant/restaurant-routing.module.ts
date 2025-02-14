import { Routes } from '@angular/router';
import { NewRestaurantComponent } from './components/new-restaurant/new-restaurant.component';
import { RestaurantComponent } from './components/restaurant.component';
import { provideEffects } from '@ngrx/effects';
import { provideState } from '@ngrx/store';
import { RestaurantEffects } from 'src/app/modules/restaurant/store/restaurant.effects';
import { restaurantReducer } from 'src/app/modules/restaurant/store/restaurant.reducer';

export const routes: Routes = [
  {
    path: '',
    component: RestaurantComponent,
    providers: [
      provideState('restaurant', restaurantReducer),
      provideEffects([RestaurantEffects]),
    ],
    children: [{
      path: '',
      pathMatch: 'full',
      redirectTo: 'new',
    }, {
      path: 'new',
      component: NewRestaurantComponent,
      data: { routeName: "new-restaurant" },
    }],
  },
  { path: '**', redirectTo: '/page/404' },
];
