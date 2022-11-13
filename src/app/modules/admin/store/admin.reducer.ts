import { Action, createReducer, on } from '@ngrx/store';
import { Command } from 'src/app/interfaces/command.interface';
import { Pastry } from 'src/app/interfaces/pastry.interface';
import { Restaurant } from 'src/app/interfaces/restaurant.interface';
import { commandsMock } from 'src/app/mocks/commands.mock';
import { pastriesMock } from 'src/app/mocks/pastry.mock';
import {
  addCommand,
  editCommand,
  setCommands,
  fetchRestaurantCommands,
  fetchRestaurant,
  setAllPastries,
  fetchAllRestaurantPastries,
  validatePastryName,
  setNameError,
  setNoNameError,
  addPastry,
} from './admin.actions';

export const adminFeatureKey = 'admin';

export interface AdminState {
  allPastries: Pastry[];
  commands: Command[];
  loading: boolean;
  nameError: { error: boolean, duplicated: boolean } | null | undefined;
  isNameValidating: boolean;
}

export const initialState: AdminState = {
  allPastries: pastriesMock,
  commands: commandsMock,
  loading: false,
  nameError: undefined,
  isNameValidating: false,
};

const adminReducer = createReducer(
  initialState,
  on(fetchAllRestaurantPastries, fetchRestaurant, fetchRestaurantCommands, (state) => ({
    ...state,
    loading: true,
  })),
  on(setAllPastries, (state, { pastries }) => ({
    ...state,
    allPastries: [...pastries],
    loading: false,
  })),
  on(addPastry, (state, { pastry }) => ({
    ...state,
    allPastries: [...state.allPastries, pastry],
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
  on(validatePastryName, (state) => ({
    ...state,
    nameError: undefined,
    isNameValidating: true,
  })),
  on(setNameError, (state, { error, duplicated }) => ({
    ...state,
    nameError: { error, duplicated },
    isNameValidating: false,
  })),
  on(setNoNameError, (state) => ({
    ...state,
    nameError: null,
    isNameValidating: false,
  })),
);

export function reducer(state: AdminState | undefined, action: Action) {
  return adminReducer(state, action);
}
