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

const reducer = createReducer(
  initialState,
  on(createRestaurant, fetchRestaurants, validateRestaurantName, (state): RestaurantState => ({
    ...state,
    loading: true,
  })),
  on(setRestaurants, (state, { restaurants }): RestaurantState => ({
    ...state,
    restaurants: [...restaurants],
    loading: false,
  })),
  on(setNewRestaurant, (state, { restaurant }): RestaurantState => ({
    ...state,
    newRestaurant: { ...restaurant },
    loading: false,
  })),
  on(validateRestaurantName, (state): RestaurantState => ({
    ...state,
    restaurantNameError: undefined,
  })),
  on(setRestaurantNameError, (state, { error, duplicated }): RestaurantState => ({
    ...state,
    restaurantNameError: { error, duplicated },
    loading: false,
  })),
  on(setRestaurantNoNameError, (state): RestaurantState => ({
    ...state,
    restaurantNameError: null,
    loading: false,
  })),
);

export function restaurantReducer(state: RestaurantState | undefined, action: Action) {
  return reducer(state, action);
}
