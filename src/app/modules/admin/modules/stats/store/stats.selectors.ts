import { createFeatureSelector, createSelector } from '@ngrx/store';
import { StatsState } from './stats.reducer';

export const selectFeature = createFeatureSelector<StatsState>('admin/stats');

export const selectPayedCommands = createSelector(
  selectFeature,
  (state: StatsState) =>
    state.commands
      .filter((c) => c.isPayed)
      .sort((a, b) => {
        const dateA = a.pickUpTime ? new Date(a.pickUpTime!).getTime() : new Date(a.createdAt!).getTime();
        const dateB = b.pickUpTime ? new Date(b.pickUpTime!).getTime() : new Date(b.createdAt!).getTime();
        return dateB - dateA;
      }),
);

export const selectTimeInterval = createSelector(
  selectFeature,
  (state: StatsState) => state.timeInterval,
);

export const selectIsLoading = createSelector(
  selectFeature,
  (state: StatsState) => state.loading,
);

export const selectAllPastries = createSelector(
  selectFeature,
  (state: StatsState) => state.allPastries,
);
