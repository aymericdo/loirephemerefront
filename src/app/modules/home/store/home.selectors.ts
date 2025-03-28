import { createFeatureSelector, createSelector } from '@ngrx/store';
import { Command } from 'src/app/interfaces/command.interface';
import { HomeState } from './home.reducer';

export const selectFeature = createFeatureSelector<HomeState>('home');

export const selectPastries = createSelector(
  selectFeature,
  (state: HomeState) => state.pastries,
);

export const selectSelectedPastries = createSelector(
  selectFeature,
  (state: HomeState) => state.selectedPastries,
);

export const selectSelectedPastriesTotalCount = createSelector(
  selectFeature,
  (state: HomeState) => Object.keys(state.selectedPastries).reduce((prev, pastryId) => {
    prev += state.selectedPastries[pastryId];
    return prev;
  }, 0),
);

export const selectIsLoading = createSelector(
  selectFeature,
  (state: HomeState) => state.loading,
);

export const selectIsStockIssue = createSelector(
  selectFeature,
  (state: HomeState) =>
    Object.keys(state.selectedPastries).some((pastryId) => {
      const pastry = state.pastries.find((p) => p.id === pastryId);
      if (!pastry?.stock) return false;
      return (
        pastry.stock -
        state.selectedPastries[pastryId] < 0
      );
    }),
);

export const selectPersonalCommand = createSelector(
  selectFeature,
  (state: HomeState) => state.personalCommand,
);

export const selectHomeModal = createSelector(
  selectFeature,
  (state: HomeState) => state.homeModal,
);

export const selectErrorCommand = createSelector(
  selectFeature,
  (state: HomeState) => state.errorCommand,
);

export const selectHasSelectedPastries = createSelector(
  selectFeature,
  (state: HomeState) =>
    Object.keys(state.selectedPastries).some(
      (key) => !!state.selectedPastries[key],
    ),
);

export const selectTotalPrice = createSelector(
  selectFeature,
  (state: HomeState) =>
    Object.keys(state.selectedPastries).reduce(
      (prev, pastryId) =>
        prev +
        (state.pastries.find((p) => p.id === pastryId)?.price || 0) *
        state.selectedPastries[pastryId],
      0,
    ),
);
