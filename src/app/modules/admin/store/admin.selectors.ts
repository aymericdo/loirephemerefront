import { createSelector } from '@ngrx/store';
import { AppState } from 'src/app/store/app.state';
import { AdminState } from './admin.reducer';

export const selectFeature = (state: AppState) => state.admin;

export const selectOnGoingCommands = createSelector(
  selectFeature,
  (state: AdminState) => state.commands.filter((c) => !c.isDone).sort((a, b) => {
    const dateA = a.pickUpTime ? new Date(a.pickUpTime!).getTime() : new Date(a.createdAt!).getTime();
    const dateB = b.pickUpTime ? new Date(b.pickUpTime!).getTime() : new Date(b.createdAt!).getTime();
    return dateA - dateB;
  }),
);

export const selectDeliveredCommands = createSelector(
  selectFeature,
  (state: AdminState) => state.commands
    .filter((c) => c.isDone && !c.isPayed)
    .sort((a, b) => {
      const dateA = a.pickUpTime ? new Date(a.pickUpTime!).getTime() : new Date(a.createdAt!).getTime();
      const dateB = b.pickUpTime ? new Date(b.pickUpTime!).getTime() : new Date(b.createdAt!).getTime();
      return dateA - dateB;
    }),
);

export const selectPayedCommands = createSelector(
  selectFeature,
  (state: AdminState) =>
    state.commands
      .filter((c) => c.isPayed)
      .sort((a, b) => {
        const dateA = a.pickUpTime ? new Date(a.pickUpTime!).getTime() : new Date(a.createdAt!).getTime();
        const dateB = b.pickUpTime ? new Date(b.pickUpTime!).getTime() : new Date(b.createdAt!).getTime();
        return dateB - dateA;
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

export const selectIsStatsLoading = createSelector(
  selectFeature,
  (state: AdminState) => state.statsLoading
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

export const selectUsers = createSelector(
  selectFeature,
  (state: AdminState) => state.users
);

export const selectUserEmailError = createSelector(
  selectFeature,
  (state: AdminState) => state.userEmailError
);

export const selectIsEmailValidating = createSelector(
  selectFeature,
  (state: AdminState) => state.isEmailValidating
);
