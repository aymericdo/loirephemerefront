import { Action, createReducer, on } from '@ngrx/store';
import { Restaurant } from 'src/app/interfaces/restaurant.interface';
import { restaurantsMock } from 'src/app/mocks/restaurants.mock';
import {
  fetchRestaurants,
  setRestaurants,
  setNameError,
  setNoNameError,
  validateNameRestaurant,
  setNewRestaurant,
  createRestaurant,
} from './restaurant.actions';

export const restaurantFeatureKey = 'restaurant';

export interface RestaurantState {
  restaurants: Restaurant[];
  restaurant: Restaurant | null;
  nameError: { error: boolean, duplicated: boolean } | null | undefined;
  loading: boolean;
}

export const initialState: RestaurantState = {
  restaurants: restaurantsMock,
  restaurant: null,
  nameError: undefined,
  loading: false,
};

const restaurantReducer = createReducer(
  initialState,
  on(createRestaurant, fetchRestaurants, validateNameRestaurant, (state) => ({
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
    restaurant: { ...restaurant },
    loading: false,
  })),
  on(validateNameRestaurant, (state) => ({
    ...state,
    nameError: undefined,
  })),
  on(setNameError, (state, { error, duplicated  }) => ({
    ...state,
    nameError: { error, duplicated  },
    loading: false,
  })),
  on(setNoNameError, (state) => ({
    ...state,
    nameError: null,
    loading: false,
  })),
);

export function reducer(state: RestaurantState | undefined, action: Action) {
  return restaurantReducer(state, action);
}
