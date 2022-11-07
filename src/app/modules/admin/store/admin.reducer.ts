import { Action, createReducer, on } from '@ngrx/store';
import { Command } from 'src/app/interfaces/command.interface';
import { Restaurant } from 'src/app/interfaces/restaurant.interface';
import { commandsMock } from 'src/app/mocks/commands.mock';
import {
  addCommand,
  editCommand,
  setCommands,
  fetchCommands,
  setRestaurant,
  fetchRestaurantCommands,
  fetchRestaurant,
} from './admin.actions';

export const adminFeatureKey = 'admin';

export interface AdminState {
  commands: Command[];
  loading: boolean;
  restaurant: Restaurant | null;
}

export const initialState: AdminState = {
  commands: commandsMock,
  loading: false,
  restaurant: null,
};

const adminReducer = createReducer(
  initialState,
  on(fetchRestaurant, fetchCommands, fetchRestaurantCommands, (state) => ({
    ...state,
    loading: true,
  })),
  on(setCommands, (state, { commands }) => ({
    ...state,
    commands: [...commands],
    loading: false,
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
  }),
  on(setRestaurant, (state, { restaurant }) => ({
    ...state,
    restaurant: { ...restaurant },
  }))
);

export function reducer(state: AdminState | undefined, action: Action) {
  return adminReducer(state, action);
}
