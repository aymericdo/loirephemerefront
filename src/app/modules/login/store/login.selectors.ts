import { createSelector } from '@ngrx/store';
import { AppState } from 'src/app/store/app.state';
import { LoginState } from './login.reducer';

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

export const selectUserRestaurants = createSelector(
  selectFeature,
  (state: LoginState) => state.userRestaurants
);

export const selectLoading = createSelector(
  selectFeature,
  (state: LoginState) => state.loading
);
