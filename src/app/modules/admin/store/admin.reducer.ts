import { Action, createReducer, on } from '@ngrx/store';
import { Command } from 'src/app/interfaces/command.interface';
import { addCommand, editCommand, setCommands } from './admin.actions';

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
  })),
  on(addCommand, (state, { command }) => ({
    ...state,
    commands: [...state.commands, command],
  })),
  on(editCommand, (state, { command }) => {
    const indexOf = state.commands.findIndex((c) => c._id === command._id);
    const newList = [...state.commands];
    newList.splice(indexOf, 1, command);

    return {
      ...state,
      commands: newList,
    };
  })
);

export function reducer(state: AdminState | undefined, action: Action) {
  return adminReducer(state, action);
}
