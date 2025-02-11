import { Action, createReducer, on } from '@ngrx/store';
import {
  setTimezones,
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
  timezones: string[];
}

export const restaurantInitialState: RestaurantState = {
  loading: false,
  isDisplayStockLoading: false,
  isAlwaysOpenLoading: false,
  timezones: [],
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
  on(setTimezones, (state, { timezones }): RestaurantState => ({
    ...state,
    timezones,
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
