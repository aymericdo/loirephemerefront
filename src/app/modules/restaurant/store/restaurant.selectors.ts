import { createSelector } from '@ngrx/store';
import { AppState } from 'src/app/store/app.state';
import { RestaurantState } from './restaurant.reducer';

export const selectFeature = (state: AppState) => state.restaurant;

export const selectRestaurants = createSelector(
  selectFeature,
  (state: RestaurantState) => state.restaurants
);

export const selectIsLoading = createSelector(
  selectFeature,
  (state: RestaurantState) => state.loading
);

export const selectRestaurantNameError = createSelector(
  selectFeature,
  (state: RestaurantState) => state.restaurantNameError
);

export const selectNewRestaurant = createSelector(
  selectFeature,
  (state: RestaurantState) => state.newRestaurant
);
