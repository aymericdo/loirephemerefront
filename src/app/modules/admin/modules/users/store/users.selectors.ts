import { createSelector } from '@ngrx/store';
import { UsersState } from './users.reducer';
import { selectFeature as selectAdminFeature } from 'src/app/modules/admin/store/admin.selectors';

export const selectFeature = createSelector(selectAdminFeature, (state) => state.users);

export const selectUsers = createSelector(
  selectFeature,
  (state: UsersState) => state.users,
);

export const selectUserEmailError = createSelector(
  selectFeature,
  (state: UsersState) => state.userEmailError,
);

export const selectIsEmailValidating = createSelector(
  selectFeature,
  (state: UsersState) => state.isEmailValidating,
);

export const selectIsLoading = createSelector(
  selectFeature,
  (state: UsersState) => state.loading,
);
