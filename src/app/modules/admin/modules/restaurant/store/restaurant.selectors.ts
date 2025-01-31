import { createSelector } from '@ngrx/store';
import { RestaurantState } from 'src/app/modules/admin/modules/restaurant/store/restaurant.reducer';
import { selectFeature as selectAdminFeature } from 'src/app/modules/admin/store/admin.selectors';

export const selectFeature = createSelector(selectAdminFeature, (state) => state.restaurant);

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
