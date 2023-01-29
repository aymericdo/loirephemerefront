import { Action, createReducer, on } from '@ngrx/store';
import {
  startLoading,
  stopLoading,
} from './restaurant.actions';

export const restaurantFeatureKey = 'restaurant';

export interface RestaurantState {
  loading: boolean;
}

export const restaurantInitialState: RestaurantState = {
  loading: false,
};

const adminReducer = createReducer(
  restaurantInitialState,
  on(startLoading, (state) => ({
    ...state,
    loading: true,
  })),
  on(stopLoading, (state) => ({
    ...state,
    loading: false,
  })),
);

export function reducer(state: RestaurantState | undefined, action: Action) {
  return adminReducer(state, action);
}
