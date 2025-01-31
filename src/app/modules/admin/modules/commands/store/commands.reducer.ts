import { Action, createReducer, on } from '@ngrx/store';
import { Command } from 'src/app/interfaces/command.interface';
import { commandsMock } from 'src/app/mocks/commands.mock';
import {
  addCommand,
  editCommand,
  fetchingRestaurantCommands,
  removeNotificationSub,
  setCommands,
  setNotificationSub,
  startLoading,
  stopLoading,
} from './commands.actions';

export const commandsFeatureKey = 'commands';

export interface CommandsState {
  commands: Command[];
  loading: boolean;
  sub: PushSubscription | null;
  adminSub: PushSubscription | null;
}

export const commandsInitialState: CommandsState = {
  commands: [...commandsMock],
  loading: false,
  sub: null,
  adminSub: null,
};

const adminReducer = createReducer(
  commandsInitialState,
  on(startLoading, fetchingRestaurantCommands, (state): CommandsState => ({
    ...state,
    loading: true,
    commands: [...commandsMock],
  })),
  on(setCommands, (state, { commands }): CommandsState => ({
    ...state,
    commands: [...commands],
  })),
  on(stopLoading, (state): CommandsState => ({
    ...state,
    loading: false,
  })),
  on(addCommand, (state, { command }): CommandsState => ({
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
  on(setNotificationSub, (state, { sub }): CommandsState => ({
    ...state,
    sub,
  })),
  on(removeNotificationSub, (state): CommandsState => ({
    ...state,
    adminSub: null,
  })),
);

export function reducer(state: CommandsState | undefined, action: Action) {
  return adminReducer(state, action);
}
