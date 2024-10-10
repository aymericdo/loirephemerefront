import { Action, createReducer, on } from '@ngrx/store';
import {
  startLoading,
  stopLoading,
  updateAlwaysOpen,
  updateOpeningPickupTime,
  updateOpeningTime,
} from './restaurant.actions';

export const restaurantFeatureKey = 'restaurant';

export interface RestaurantState {
  loading: boolean;
  isAlwaysOpenLoading: boolean;
}

export const restaurantInitialState: RestaurantState = {
  loading: false,
  isAlwaysOpenLoading: false,
};

const adminRestaurantReducer = createReducer(
  restaurantInitialState,
  on(updateOpeningPickupTime, updateOpeningTime, startLoading, (state) => ({
    ...state,
    loading: true,
  })),
  on(updateAlwaysOpen, (state) => ({
    ...state,
    isAlwaysOpenLoading: true,
  })),
  on(stopLoading, (state) => ({
    ...state,
    loading: false,
    isAlwaysOpenLoading: false,
  })),
);

export function reducer(state: RestaurantState | undefined, action: Action) {
  return adminRestaurantReducer(state, action);
}
