import { Action, createReducer, on } from '@ngrx/store';
import { Restaurant } from 'src/app/interfaces/restaurant.interface';
import { restaurantsMock } from 'src/app/mocks/restaurants.mock';
import {
  createRestaurant,
  fetchRestaurants,
  setNewRestaurant,
  setRestaurantNameError,
  setRestaurantNoNameError,
  setRestaurants,
  validateRestaurantName,
} from './restaurant.actions';

export const restaurantFeatureKey = 'restaurant';

export interface RestaurantState {
  restaurants: Restaurant[];
  restaurantNameError: { error: boolean, duplicated: boolean } | null | undefined;
  loading: boolean;
  newRestaurant: Restaurant | null;
}

export const initialState: RestaurantState = {
  restaurants: restaurantsMock,
  restaurantNameError: undefined,
  loading: false,
  newRestaurant: null,
};

const restaurantReducer = createReducer(
  initialState,
  on(createRestaurant, fetchRestaurants, validateRestaurantName, (state) => ({
    ...state,
    loading: true,
  })),
  on(setRestaurants, (state, { restaurants }) => ({
    ...state,
    restaurants: [...restaurants],
    loading: false,
  })),
  on(setNewRestaurant, (state, { restaurant }) => ({
    ...state,
    newRestaurant: { ...restaurant },
    loading: false,
  })),
  on(validateRestaurantName, (state) => ({
    ...state,
    restaurantNameError: undefined,
  })),
  on(setRestaurantNameError, (state, { error, duplicated }) => ({
    ...state,
    restaurantNameError: { error, duplicated },
    loading: false,
  })),
  on(setRestaurantNoNameError, (state) => ({
    ...state,
    restaurantNameError: null,
    loading: false,
  })),
);

export function reducer(state: RestaurantState | undefined, action: Action) {
  return restaurantReducer(state, action);
}
