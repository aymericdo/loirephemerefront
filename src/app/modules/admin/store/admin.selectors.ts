import { createSelector } from '@ngrx/store';
import { AppState } from 'src/app/store/app.state';
import { AdminState } from './admin.reducer';
import { commandsMock } from 'src/app/mocks/commands.mock';

export const selectFeature = (state: AppState) => state.admin;

export const selectOnGoingCommands = createSelector(
  selectFeature,
  (state: AdminState) => state.commands.filter((c) => !c.isDone)
);

export const selectPastCommands = createSelector(
  selectFeature,
  (state: AdminState) => [
    ...state.commands
      .filter((c) => c.isDone && !c.isPayed)
      .sort((a, b) => {
        return (
          new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
        );
      }),
    ...state.commands
      .filter((c) => c.isDone && c.isPayed)
      .sort((a, b) => {
        return (
          new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
        );
      }),
  ]
);

export const selectPayedCommands = createSelector(
  selectFeature,
  (state: AdminState) =>
    state.commands
      .filter((c) => c.isPayed)
      .sort((a, b) => {
        return (
          new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
        );
      })
);

export const selectTotalPayedCommands = createSelector(
  selectFeature,
  (state: AdminState) =>
    state.commands
      .filter((c) => c.isPayed)
      .reduce((prev, c) => c.totalPrice + prev, 0)
);

export const selectIsLoading = createSelector(
  selectFeature,
  (state: AdminState) => state.loading
);

export const selectAllPastries = createSelector(
  selectFeature,
  (state: AdminState) => state.allPastries
);
