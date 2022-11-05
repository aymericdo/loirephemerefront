import { createAction, props } from '@ngrx/store';
import { Restaurant } from 'src/app/interfaces/restaurant.interface';

export const fetchRestaurants = createAction('[Restaurant page] Fetch restaurants');
export const setRestaurants = createAction(
  '[Restaurant page] Set restaurants',
  props<{ restaurants: Restaurant[] }>()
);
export const setNewRestaurant = createAction(
  '[Restaurant page] Set new restaurant',
  props<{ restaurant: Restaurant }>()
);
export const createRestaurant = createAction(
  '[Restaurant page] Create restaurant',
  props<{ name: string }>()
);
