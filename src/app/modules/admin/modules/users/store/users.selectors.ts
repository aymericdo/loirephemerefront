import { createSelector } from '@ngrx/store';
import { AppState } from 'src/app/store/app.state';
import { UsersState } from './users.reducer';

export const selectFeature = (state: AppState) => state.admin.users;

export const selectUsers = createSelector(
  selectFeature,
  (state: UsersState) => state.users
);

export const selectUserEmailError = createSelector(
  selectFeature,
  (state: UsersState) => state.userEmailError
);

export const selectIsEmailValidating = createSelector(
  selectFeature,
  (state: UsersState) => state.isEmailValidating
);

export const selectIsLoading = createSelector(
  selectFeature,
  (state: UsersState) => state.loading
);
