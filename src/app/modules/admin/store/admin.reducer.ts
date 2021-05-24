import { Action, createReducer, on } from '@ngrx/store';
import { Command } from 'src/app/interfaces/command.interface';
import { setCommands } from './admin.actions';

export const adminFeatureKey = 'admin';

export interface AdminState {
  commands: Command[];
}

export const initialState: AdminState = {
  commands: [],
};

const adminReducer = createReducer(
  initialState,
  on(setCommands, (state, { commands }) => ({
    ...state,
    commands: [...commands],
  }))
);

export function reducer(state: AdminState | undefined, action: Action) {
  return adminReducer(state, action);
}
