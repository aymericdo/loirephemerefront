import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AdminState } from './admin.reducer';

export const selectFeature = createFeatureSelector<AdminState>('admin');

export const selectIsLoading = createSelector(
  selectFeature,
  (state: AdminState) => state.loading,
);
