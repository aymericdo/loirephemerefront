import { createSelector } from '@ngrx/store';
import { AppState } from 'src/app/store/app.state';
import { LoginState } from './login.reducer';
import { Restaurant } from 'src/app/interfaces/restaurant.interface';
import { User } from 'src/app/interfaces/user.interface';

export const selectFeature = (state: AppState) => state.login;

export const selectUserEmailError = createSelector(
  selectFeature,
  (state: LoginState) => state.userEmailError
);

export const selectIsEmailValidating = createSelector(
  selectFeature,
  (state: LoginState) => state.isEmailValidating
);

export const selectUserAuthError = createSelector(
  selectFeature,
  (state: LoginState) => state.userAuthError
);

export const selectUser = createSelector(
  selectFeature,
  (state: LoginState) => state.user
);

export const selectDemoResto = createSelector(
  selectFeature,
  (state: LoginState) => state.demoResto
);

export const selectUserRestaurants = createSelector(
  selectFeature,
  selectDemoResto,
  selectUser,
  (state: LoginState, demoResto: Restaurant | null, user: User | null) => state.userRestaurants?.filter((resto) => {
    return resto.code != demoResto?.code || user?.displayDemoResto;
  }) || null
);

export const selectLoading = createSelector(
  selectFeature,
  (state: LoginState) => state.loading
);

export const selectCode2 = createSelector(
  selectFeature,
  (state: LoginState) => state.code2
);

export const selectConfirmationModalOpened = createSelector(
  selectFeature,
  (state: LoginState) => state.confirmationModalOpened
);

export const selectRecoverModalOpened = createSelector(
  selectFeature,
  (state: LoginState) => state.recoverModalOpened
);

export const selectPasswordChanged = createSelector(
  selectFeature,
  (state: LoginState) => state.passwordChanged
);

export const selectUserFetching = createSelector(
  selectFeature,
  (state: LoginState) => state.userFetching
);

export const selectDemoRestoFetching = createSelector(
  selectFeature,
  (state: LoginState) => state.demoRestoFetching
);

export const selectRestaurantFetching = createSelector(
  selectFeature,
  (state: LoginState) => state.restaurantFetching
);

export const selectRestaurant = createSelector(
  selectFeature,
  (state: LoginState) => state.restaurant
);

export const selectRestaurantPublicKey = createSelector(
  selectFeature,
  (state: LoginState) => state.restaurant?.paymentInformationPublicKey
);

export const selectIsSiderCollapsed = createSelector(
  selectFeature,
  (state: LoginState) => state.isSiderCollapsed
);

export const selectFirstNavigationStarting = createSelector(
  selectFeature,
  (state: LoginState) => state.firstNavigationStarting
);
