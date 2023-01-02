import { createSelector } from '@ngrx/store';
import { AppState } from 'src/app/store/app.state';
import { AdminState } from './admin.reducer';

export const selectFeature = (state: AppState) => state.admin;

export const selectIsLoading = createSelector(
  selectFeature,
  (state: AdminState) => state.loading
);

export const selectIsSavingPastry = createSelector(
  selectFeature,
  (state: AdminState) => state.isSavingPastry
);

export const selectIsMovingPastry = createSelector(
  selectFeature,
  (state: AdminState) => state.isMovingPastry
);

export const selectAllPastries = createSelector(
  selectFeature,
  (state: AdminState) => state.allPastries
);

export const selectIsNameValidating = createSelector(
  selectFeature,
  (state: AdminState) => state.isNameValidating
);

export const selectPastryNameError = createSelector(
  selectFeature,
  (state: AdminState) => state.pastryNameError
);

export const selectMenuModalOpened = createSelector(
  selectFeature,
  (state: AdminState) => state.menuModalOpened
);

export const selectPastryNameDeactivated = createSelector(
  selectFeature,
  (state: AdminState) => state.pastryNameDeactivated
);

export const selectEditingPastry = createSelector(
  selectFeature,
  (state: AdminState) => state.editingPastry
);

