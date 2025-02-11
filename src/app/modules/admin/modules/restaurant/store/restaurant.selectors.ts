import { createFeatureSelector, createSelector } from '@ngrx/store';
import { RestaurantState } from 'src/app/modules/admin/modules/restaurant/store/restaurant.reducer';

export const selectFeature = createFeatureSelector<RestaurantState>('admin/restaurant');

export const selectIsAlwaysOpenLoading = createSelector(
  selectFeature,
  (state: RestaurantState) => state.isAlwaysOpenLoading,
);

export const selectIsDisplayStockLoading = createSelector(
  selectFeature,
  (state: RestaurantState) => state.isDisplayStockLoading,
);

export const selectIsLoading = createSelector(
  selectFeature,
  (state: RestaurantState) => state.loading || state.isAlwaysOpenLoading,
);

export const selectTimezones = createSelector(
  selectFeature,
  (state: RestaurantState) => state.timezones,
);
