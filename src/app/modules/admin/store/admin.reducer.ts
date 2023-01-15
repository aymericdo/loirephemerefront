import { Action, createReducer, on } from '@ngrx/store';
import { CommandsState, commandsInitialState } from 'src/app/modules/admin/modules/commands/store/commands.reducer';
import { MenuState, menuInitialState } from 'src/app/modules/admin/modules/menu/store/menu.reducer';
import { StatsState, statsInitialState } from 'src/app/modules/admin/modules/stats/store/stats.reducer';
import { UsersState, usersInitialState } from 'src/app/modules/admin/modules/users/store/users.reducer';
import {
  stopLoading
} from './admin.actions';

export const adminFeatureKey = 'admin';

export interface AdminState {
  loading: boolean;
  stats: StatsState;
  users: UsersState;
  commands: CommandsState;
  menu: MenuState;
}

export const initialState: AdminState = {
  loading: false,
  users: usersInitialState,
  stats: statsInitialState,
  commands: commandsInitialState,
  menu: menuInitialState,
};

const adminReducer = createReducer(
  initialState,
  on(stopLoading, (state) => ({
    ...state,
    loading: false,
  })),
);

export function reducer(state: AdminState | undefined, action: Action) {
  return adminReducer(state, action);
}
