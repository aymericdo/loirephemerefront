import { createFeatureSelector, createSelector } from '@ngrx/store';
import { MenuState } from './menu.reducer';

export const selectFeature = createFeatureSelector<MenuState>('admin/menu');

export const selectIsLoading = createSelector(
  selectFeature,
  (state: MenuState) => state.loading,
);

export const selectIsSavingPastry = createSelector(
  selectFeature,
  (state: MenuState) => state.isSavingPastry,
);

export const selectIsMovingPastry = createSelector(
  selectFeature,
  (state: MenuState) => state.isMovingPastry,
);

export const selectAllPastries = createSelector(
  selectFeature,
  (state: MenuState) => state.allPastries,
);

export const selectIsNameValidating = createSelector(
  selectFeature,
  (state: MenuState) => state.isNameValidating,
);

export const selectPastryNameError = createSelector(
  selectFeature,
  (state: MenuState) => state.pastryNameError,
);

export const selectMenuModalOpened = createSelector(
  selectFeature,
  (state: MenuState) => state.menuModalOpened,
);

export const selectPastryNameDeactivated = createSelector(
  selectFeature,
  (state: MenuState) => state.pastryNameDeactivated,
);

export const selectEditingPastry = createSelector(
  selectFeature,
  (state: MenuState) => state.editingPastry,
);

