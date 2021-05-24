import { createSelector } from '@ngrx/store';
import { AppState } from 'src/app/store/app.state';
import { HomeState } from './home.reducer';

export const selectFeature = (state: AppState) => state.home;

export const selectPastries = createSelector(
  selectFeature,
  (state: HomeState) => state.pastries
);

export const selectSelectedPastries = createSelector(
  selectFeature,
  (state: HomeState) => state.selectedPastries
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
