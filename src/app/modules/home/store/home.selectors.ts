import { createSelector } from '@ngrx/store';
import { AppState } from 'src/app/store/app.state';
import { HomeState } from './home.reducer';

export const selectFeature = (state: AppState) => state.home;

export const TIPS_ID = '60aebea4bec7f2f43b69744a';

export const selectPastries = createSelector(
  selectFeature,
  (state: HomeState) =>
    [
      ...state.pastries.filter((p) => !p.hidden && p._id !== TIPS_ID),
      state.pastries.find((p) => p._id === TIPS_ID)!,
    ].filter(Boolean)
);

export const selectSelectedPastries = createSelector(
  selectFeature,
  (state: HomeState) => state.selectedPastries
);

export const selectIsLoading = createSelector(
  selectFeature,
  (state: HomeState) => state.loading
);

export const selectIsStockIssue = createSelector(
  selectFeature,
  (state: HomeState) =>
    Object.keys(state.selectedPastries).some((pastryId) => {
      if (pastryId === TIPS_ID) return false;
      return (
        state.pastries.find((p) => p._id === pastryId)!.stock -
          state.selectedPastries[pastryId] <
        0
      );
    })
);

export const selectTable = createSelector(
  selectFeature,
  (state: HomeState) => state.table
);

export const selectPersonalCommand = createSelector(
  selectFeature,
  (state: HomeState) => state.personalCommand
);

export const selectErrorCommand = createSelector(
  selectFeature,
  (state: HomeState) => state.errorCommand
);

export const selectHasSelectedPastries = createSelector(
  selectFeature,
  (state: HomeState) =>
    Object.keys(state.selectedPastries).some(
      (key) => !!state.selectedPastries[key]
    )
);

export const selectTotalPrice = createSelector(
  selectFeature,
  (state: HomeState) =>
    Object.keys(state.selectedPastries).reduce(
      (prev, pastryId) =>
        prev +
        (state.pastries.find((p) => p._id === pastryId)?.price || 0) *
          state.selectedPastries[pastryId],
      0
    )
);
