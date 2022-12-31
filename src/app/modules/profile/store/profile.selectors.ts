import { createSelector } from '@ngrx/store';
import { AppState } from 'src/app/store/app.state';
import { ProfileState } from './profile.reducer';

export const selectFeature = (state: AppState) => state.profile;

export const selectLoading = createSelector(
  selectFeature,
  (state: ProfileState) => state.loading
);

export const selectPasswordChanged = createSelector(
  selectFeature,
  (state: ProfileState) => state.passwordChanged
);

export const selectChangePasswordError = createSelector(
  selectFeature,
  (state: ProfileState) => state.changePasswordError
);
