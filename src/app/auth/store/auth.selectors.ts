import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AuthState } from './auth.reducer';
import { Restaurant } from 'src/app/interfaces/restaurant.interface';
import { Access, User } from 'src/app/interfaces/user.interface';

export const selectFeature = createFeatureSelector<AuthState>('auth');

export const selectUser = createSelector(
  selectFeature,
  (state: AuthState) => state.user,
);

export const selectRestaurant = createSelector(
  selectFeature,
  (state: AuthState) => state.restaurant,
);

export const selectRestaurantId = createSelector(
  selectFeature,
  (state: AuthState) => state.restaurant?.id,
);

export const selectUserAccess = createSelector(
  selectFeature,
  (state: AuthState) => state.user?.access as { [restaurantId: string]: Access[] },
);

export const selectUserWaiterMode = createSelector(
  selectFeature,
  (state: AuthState) => state.user?.waiterMode as { [restaurantId: string]: boolean },
);

export const selectCurrentWaiterMode = createSelector(
  selectUserWaiterMode,
  selectRestaurantId,
  (waiterMode, groupId) => {
    if (!groupId || !waiterMode) return

    if (typeof waiterMode === 'boolean') {
      return waiterMode;
    }

    return waiterMode[groupId] ?? false;
  }
);

export const selectDemoResto = createSelector(
  selectFeature,
  (state: AuthState) => state.demoResto,
);

export const selectUserRestaurants = createSelector(
  selectFeature,
  selectDemoResto,
  selectUser,
  (state: AuthState, demoResto: Restaurant | null, user: User | null) => state.userRestaurants?.filter((resto) => {
    return resto.code != demoResto?.code || user?.displayDemoResto;
  }) || null,
);

export const selectLoading = createSelector(
  selectFeature,
  (state: AuthState) => state.loading,
);

export const selectUserFetching = createSelector(
  selectFeature,
  (state: AuthState) => state.userFetching,
);

export const selectDemoRestoFetching = createSelector(
  selectFeature,
  (state: AuthState) => state.demoRestoFetching,
);

export const selectRestaurantFetching = createSelector(
  selectFeature,
  (state: AuthState) => state.restaurantFetching,
);

export const selectRestaurantPublicKey = createSelector(
  selectFeature,
  (state: AuthState) => state.paymentInformationPublicKey,
);

export const selectIsSiderCollapsed = createSelector(
  selectFeature,
  (state: AuthState) => state.isSiderCollapsed,
);

export const selectFirstNavigationStarting = createSelector(
  selectFeature,
  (state: AuthState) => state.firstNavigationStarting,
);

export const selectAllRestaurantsFetching = createSelector(
  selectRestaurantFetching,
  selectDemoRestoFetching,
  selectFirstNavigationStarting,
  (restaurantFetching, demoRestoFetching, firstNavigationStarting) => {
    return restaurantFetching || demoRestoFetching || firstNavigationStarting;
  },
);
