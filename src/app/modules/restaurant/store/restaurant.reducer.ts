import { Action, createReducer, on } from '@ngrx/store';
import { Restaurant } from 'src/app/interfaces/restaurant.interface';
import { restaurantsMock } from 'src/app/mocks/restaurants.mock';
import {
  fetchRestaurants,
  setRestaurants,
  setNameError,
  setNoNameError,
  validateNameRestaurant,
} from './restaurant.actions';

export const restaurantFeatureKey = 'restaurant';

export interface RestaurantState {
  restaurants: Restaurant[];
  nameError: { error: boolean, duplicated: boolean } | null | undefined;
  loading: boolean;
}

export const initialState: RestaurantState = {
  restaurants: restaurantsMock,
  nameError: undefined,
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
  on(validateNameRestaurant, (state) => ({
    ...state,
    nameError: undefined,
  })),
  on(setNameError, (state, { error, duplicated  }) => ({
    ...state,
    nameError: { error, duplicated  },
  })),
  on(setNoNameError, (state) => ({
    ...state,
    nameError: null,
  })),
);

export function reducer(state: RestaurantState | undefined, action: Action) {
  return restaurantReducer(state, action);
}
