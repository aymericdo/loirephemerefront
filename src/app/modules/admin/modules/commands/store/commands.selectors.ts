import { createFeatureSelector, createSelector } from '@ngrx/store';
import { Command, CommandWithMerged } from 'src/app/interfaces/command.interface';
import { CommandsState } from 'src/app/modules/admin/modules/commands/store/commands.reducer';

export const selectFeature = createFeatureSelector<CommandsState>('admin/commands');

const getCommandDate = (command: Command) =>
  command.pickUpTime ? new Date(command.pickUpTime).getTime() : new Date(command.createdAt).getTime();

const sortByDate = (a: Command, b: Command) => getCommandDate(a) - getCommandDate(b);

const groupMergedCommands = (commands: Command[]): CommandWithMerged[] => {
  const commandMap = new Map<string, CommandWithMerged>();
  const mergedIds = new Set<string>();

  commands.forEach((cmd) => commandMap.set(cmd.id, { ...cmd }));

  return commands
    .map((cmd) => {
      if (mergedIds.has(cmd.id)) {
        return null;
      }

      const mainCmd = commandMap.get(cmd.id)!;

      if (cmd.mergedCommandIds && cmd.mergedCommandIds.length > 0) {
        mainCmd.mergedCommands = cmd.mergedCommandIds
          .map((mergedId) => {
            const mergedCmd = commandMap.get(mergedId);
            if (mergedCmd) {
              mergedIds.add(mergedId);
              return mergedCmd;
            }
            return null;
          })
          .filter((cmd): cmd is Command => cmd !== null); // Filtrer les valeurs null
      }

      return mainCmd;
    })
    .filter((cmd): cmd is CommandWithMerged => cmd !== null);
};

export const selectOnGoingCommands = createSelector(
  selectFeature,
  (state: CommandsState) => groupMergedCommands(
    state.commands
      .filter((c) => !c.isDone && !c.isCancelled)
      .sort(sortByDate),
  ),
);

export const selectDeliveredCommands = createSelector(
  selectFeature,
  (state: CommandsState) => groupMergedCommands(
    state.commands
      .filter((c) => c.isDone && !c.isPayed && !c.isCancelled)
      .sort(sortByDate),
  ),
);

export const selectPayedCommands = createSelector(
  selectFeature,
  (state: CommandsState) =>
    state.commands
      .filter((c: Command) => c.isPayed && !c.isCancelled)
      .sort(sortByDate),
);

export const selectCancelledCommands = createSelector(
  selectFeature,
  (state: CommandsState) =>
    state.commands
      .filter((c: Command) => c.isCancelled)
      .sort(sortByDate),
);

export const selectTotalPayedCommands = createSelector(
  selectFeature,
  (state: CommandsState) =>
    state.commands
      .filter((c: Command) => c.isPayed)
      .reduce((prev, c) => c.totalPrice + prev, 0),
);

export const selectIsLoading = createSelector(
  selectFeature,
  (state: CommandsState) => state.loading,
);
