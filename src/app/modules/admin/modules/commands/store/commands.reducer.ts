import { Action, createReducer, on } from '@ngrx/store';
import { Command } from 'src/app/interfaces/command.interface';
import { commandsMock } from 'src/app/mocks/commands.mock';
import {
  addCommand,
  editCommand,
  fetchingRestaurantCommands,
  setCommands,
  startLoading,
  stopLoading,
} from './commands.actions';

export const commandsFeatureKey = 'commands';

export interface CommandsState {
  commands: Command[];
  loading: boolean;
}

export const commandsInitialState: CommandsState = {
  commands: [...commandsMock],
  loading: false,
};

const adminReducer = createReducer(
  commandsInitialState,
  on(startLoading, fetchingRestaurantCommands, (state) => ({
    ...state,
    loading: true,
    commands: [...commandsMock],
  })),
  on(setCommands, (state, { commands }) => ({
    ...state,
    commands: [...commands],
  })),
  on(stopLoading, (state) => ({
    ...state,
    loading: false,
  })),
  on(addCommand, (state, { command }) => ({
    ...state,
    commands: [...state.commands, command],
  })),
  on(editCommand, (state, { command }) => {
    const indexOf = state.commands.findIndex((c) => c.id === command.id);
    const newList: Command[] = [...state.commands];
    newList.splice(indexOf, 1, command);

    return {
      ...state,
      commands: newList,
    };
  }),

);

export function reducer(state: CommandsState | undefined, action: Action) {
  return adminReducer(state, action);
}
