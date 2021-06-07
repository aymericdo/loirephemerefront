import { createSelector } from '@ngrx/store';
import { AppState } from 'src/app/store/app.state';
import { AdminState } from './admin.reducer';

export const selectFeature = (state: AppState) => state.admin;

export const selectOnGoingCommands = createSelector(
  selectFeature,
  (state: AdminState) => state.commands.filter((c) => !c.isDone)
);

export const selectPastCommands = createSelector(
  selectFeature,
  (state: AdminState) =>
    state.commands
      .filter((c) => c.isDone)
      .sort((a, b) => {
        return (
          new Date(b.updatedAt!).getTime() - new Date(a.updatedAt!).getTime()
        );
      })
);
