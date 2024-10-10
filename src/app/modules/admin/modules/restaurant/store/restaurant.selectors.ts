import { createSelector } from '@ngrx/store';
import { RestaurantState } from 'src/app/modules/admin/modules/restaurant/store/restaurant.reducer';
import { AppState } from 'src/app/store/app.state';

export const selectFeature = (state: AppState) => state.admin.restaurant;

export const selectIsAlwaysOpenLoading = createSelector(
  selectFeature,
  (state: RestaurantState) => state.isAlwaysOpenLoading
);

export const selectIsDisplayStockLoading = createSelector(
  selectFeature,
  (state: RestaurantState) => state.isDisplayStockLoading
);

export const selectIsLoading = createSelector(
  selectFeature,
  (state: RestaurantState) => state.loading || state.isAlwaysOpenLoading
);
