import { createFeatureSelector, createSelector } from "@ngrx/store";
import { LoginState } from "src/app/modules/login/store/login.reducer";

const selectFeature = createFeatureSelector<LoginState>('login');

export const selectLoading = createSelector(
  selectFeature,
  (state: LoginState) => state.loading,
);

export const selectPasswordChanged = createSelector(
  selectFeature,
  (state: LoginState) => state.passwordChanged,
);

export const selectCode2 = createSelector(
  selectFeature,
  (state: LoginState) => state.code2,
);

export const selectConfirmationModalOpened = createSelector(
  selectFeature,
  (state: LoginState) => state.confirmationModalOpened,
);

export const selectRecoverModalOpened = createSelector(
  selectFeature,
  (state: LoginState) => state.recoverModalOpened,
);

export const selectUserEmailError = createSelector(
  selectFeature,
  (state: LoginState) => state.userEmailError,
);

export const selectIsEmailValidating = createSelector(
  selectFeature,
  (state: LoginState) => state.isEmailValidating,
);

export const selectUserAuthError = createSelector(
  selectFeature,
  (state: LoginState) => state.userAuthError,
);

