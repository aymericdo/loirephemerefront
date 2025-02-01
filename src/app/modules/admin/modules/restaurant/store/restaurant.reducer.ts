import { Action, createReducer, on } from '@ngrx/store';
import {
  startLoading,
  stopLoading,
  updateAlwaysOpen,
  updateDisplayStock,
  updateOpeningPickupTime,
  updateOpeningTime,
  updatePaymentInformation,
} from './restaurant.actions';

export interface RestaurantState {
  loading: boolean;
  isDisplayStockLoading: boolean;
  isAlwaysOpenLoading: boolean;
}

export const restaurantInitialState: RestaurantState = {
  loading: false,
  isDisplayStockLoading: false,
  isAlwaysOpenLoading: false,
};

const adminRestaurantReducer = createReducer(
  restaurantInitialState,
  on(updatePaymentInformation, updateOpeningPickupTime, updateOpeningTime, startLoading, (state): RestaurantState => ({
    ...state,
    loading: true,
  })),
  on(updateAlwaysOpen, (state): RestaurantState => ({
    ...state,
    isAlwaysOpenLoading: true,
  })),
  on(updateDisplayStock, (state): RestaurantState => ({
    ...state,
    isDisplayStockLoading: true,
  })),
  on(stopLoading, (state): RestaurantState => ({
    ...state,
    loading: false,
    isAlwaysOpenLoading: false,
    isDisplayStockLoading: false,
  })),
);

export function reducer(state: RestaurantState | undefined, action: Action) {
  return adminRestaurantReducer(state, action);
}
