import { Action, createReducer, on } from '@ngrx/store';
import { Restaurant } from 'src/app/interfaces/restaurant.interface';
import { restaurantsMock } from 'src/app/mocks/restaurants.mock';
import {
  fetchRestaurants,
  setRestaurants,
} from './restaurant.actions';

export const restaurantFeatureKey = 'restaurant';

export interface RestaurantState {
  restaurants: Restaurant[];
  loading: boolean;
}

export const initialState: RestaurantState = {
  restaurants: restaurantsMock,
  loading: false,
};

const restaurantReducer = createReducer(
  initialState,
  on(fetchRestaurants, (state) => ({
    ...state,
    loading: true,
  })),
  on(setRestaurants, (state, { restaurants }) => ({
    ...state,
    restaurants: [...restaurants],
    loading: false,
  })),
);

export function reducer(state: RestaurantState | undefined, action: Action) {
  return restaurantReducer(state, action);
}
