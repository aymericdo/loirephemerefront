import { createSelector } from '@ngrx/store';
import { Command } from 'src/app/interfaces/command.interface';
import { CommandsState } from 'src/app/modules/admin/modules/commands/store/commands.reducer';
import { AppState } from 'src/app/store/app.state';

export const selectFeature = (state: AppState) => state.admin.commands;

export const selectOnGoingCommands = createSelector(
  selectFeature,
  (state: CommandsState) => state.commands
    .filter((c) => !c.isDone && !c.isCancelled)
    .sort((a, b) => {
      const dateA = a.pickUpTime ? new Date(a.pickUpTime!).getTime() : new Date(a.createdAt!).getTime();
      const dateB = b.pickUpTime ? new Date(b.pickUpTime!).getTime() : new Date(b.createdAt!).getTime();
      return dateA - dateB;
    }),
);

export const selectDeliveredCommands = createSelector(
  selectFeature,
  (state: CommandsState) => state.commands
    .filter((c) => c.isDone && !c.isPayed && !c.isCancelled)
    .sort((a, b) => {
      const dateA = a.pickUpTime ? new Date(a.pickUpTime!).getTime() : new Date(a.createdAt!).getTime();
      const dateB = b.pickUpTime ? new Date(b.pickUpTime!).getTime() : new Date(b.createdAt!).getTime();
      return dateA - dateB;
    }),
);

export const selectPayedCommands = createSelector(
  selectFeature,
  (state: CommandsState) =>
    state.commands
      .filter((c: Command) => c.isPayed && !c.isCancelled)
      .sort((a, b) => {
        const dateA = a.pickUpTime ? new Date(a.pickUpTime!).getTime() : new Date(a.createdAt!).getTime();
        const dateB = b.pickUpTime ? new Date(b.pickUpTime!).getTime() : new Date(b.createdAt!).getTime();
        return dateB - dateA;
      })
);

export const selectCancelledCommands = createSelector(
  selectFeature,
  (state: CommandsState) =>
    state.commands
      .filter((c: Command) => c.isCancelled)
      .sort((a, b) => {
        const dateA = a.pickUpTime ? new Date(a.pickUpTime!).getTime() : new Date(a.createdAt!).getTime();
        const dateB = b.pickUpTime ? new Date(b.pickUpTime!).getTime() : new Date(b.createdAt!).getTime();
        return dateB - dateA;
      })
);

export const selectTotalPayedCommands = createSelector(
  selectFeature,
  (state: CommandsState) =>
    state.commands
      .filter((c: Command) => c.isPayed)
      .reduce((prev, c) => c.totalPrice + prev, 0)
);

export const selectIsLoading = createSelector(
  selectFeature,
  (state: CommandsState) => state.loading
);
