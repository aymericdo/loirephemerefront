import { createSelector } from '@ngrx/store';
import { AppState } from 'src/app/store/app.state';
import { LoginState } from './login.reducer';

export const selectFeature = (state: AppState) => state.login;

export const selectToken = createSelector(
  selectFeature,
  (state: LoginState) => state.token
);

export const selectUserEmailError = createSelector(
  selectFeature,
  (state: LoginState) => state.userEmailError
);

export const selectIsEmailValidating = createSelector(
  selectFeature,
  (state: LoginState) => state.isEmailValidating
);
