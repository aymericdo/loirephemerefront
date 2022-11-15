import { Action, createReducer, on } from '@ngrx/store';
import { Command } from 'src/app/interfaces/command.interface';
import { Pastry } from 'src/app/interfaces/pastry.interface';
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
  setPastryNameError,
  setPastryNoNameError,
  addPastry,
  creatingPastry,
  pastryCreated,
  openMenuModal,
  closeMenuModal,
} from './admin.actions';

export const adminFeatureKey = 'admin';

export interface AdminState {
  allPastries: Pastry[];
  commands: Command[];
  loading: boolean;
  pastryNameError: { error: boolean, duplicated: boolean } | null | undefined;
  isNameValidating: boolean;
  isCreatingPastry: boolean;
  menuModalOpened: 'new' | 'edit' | null,
}

export const initialState: AdminState = {
  allPastries: pastriesMock,
  commands: commandsMock,
  loading: false,
  pastryNameError: undefined,
  isNameValidating: false,
  isCreatingPastry: false,
  menuModalOpened: null,
};

const adminReducer = createReducer(
  initialState,

  // Common
  on(fetchAllRestaurantPastries, fetchRestaurant, fetchRestaurantCommands, (state) => ({
    ...state,
    loading: true,
  })),
  on(setAllPastries, (state, { pastries }) => ({
    ...state,
    allPastries: [...pastries],
    loading: false,
  })),
  on(setCommands, (state, { commands }) => ({
    ...state,
    commands: [...commands],
    loading: false,
  })),

  // Command
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

  // Menu
  on(addPastry, (state, { pastry }) => ({
    ...state,
    allPastries: [...state.allPastries, pastry],
  })),
  on(validatePastryName, (state) => ({
    ...state,
    pastryNameError: undefined,
    isNameValidating: true,
  })),
  on(creatingPastry, (state) => ({
    ...state,
    isCreatingPastry: true,
  })),
  on(pastryCreated, (state) => ({
    ...state,
    isCreatingPastry: false,
  })),
  on(setPastryNameError, (state, { error, duplicated }) => ({
    ...state,
    pastryNameError: { error, duplicated },
    isNameValidating: false,
  })),
  on(setPastryNoNameError, (state) => ({
    ...state,
    pastryNameError: null,
    isNameValidating: false,
  })),
  on(openMenuModal, (state, { modal }) => ({
    ...state,
    menuModalOpened: modal,
  })),
  on(closeMenuModal, (state) => ({
    ...state,
    menuModalOpened: null,
  })),
);

export function reducer(state: AdminState | undefined, action: Action) {
  return adminReducer(state, action);
}
