import { createFeatureSelector, createSelector } from '@ngrx/store';
import { DashboardState } from 'src/app/modules/admin/modules/dashboard/store/dashboard.reducer';

export const selectFeature = createFeatureSelector<DashboardState>('admin/dashboard');

export const selectIsLoading = createSelector(
  selectFeature,
  (state: DashboardState) => state.loading,
);

export const selectUsersCount = createSelector(
  selectFeature,
  (state: DashboardState) => state.usersCount,
);

export const selectCommandsCount = createSelector(
  selectFeature,
  (state: DashboardState) => state.commandsCount,
);

export const selectPayedCommandsCount = createSelector(
  selectFeature,
  (state: DashboardState) => state.payedCommandsCount,
);
