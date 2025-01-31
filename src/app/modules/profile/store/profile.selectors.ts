import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ProfileState } from './profile.reducer';

export const selectFeature = createFeatureSelector<ProfileState>('profile');

export const selectLoading = createSelector(
  selectFeature,
  (state: ProfileState) => state.loading,
);

export const selectPasswordChanged = createSelector(
  selectFeature,
  (state: ProfileState) => state.passwordChanged,
);

export const selectChangePasswordError = createSelector(
  selectFeature,
  (state: ProfileState) => state.changePasswordError,
);
