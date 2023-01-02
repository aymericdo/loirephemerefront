import { createSelector } from '@ngrx/store';
import { AppState } from 'src/app/store/app.state';
import { AdminState } from './admin.reducer';

export const selectFeature = (state: AppState) => state.admin;

export const selectIsLoading = createSelector(
  selectFeature,
  (state: AdminState) => state.loading
);
