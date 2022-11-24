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
  postingPastry,
  pastryCreated,
  openMenuModal,
  closeMenuModal,
  editingPastry,
  pastryEdited,
  editPastry,
  reorderPastries,
  movingPastry,
  pastryMoved,
} from './admin.actions';

export const adminFeatureKey = 'admin';

export interface AdminState {
  allPastries: Pastry[];
  commands: Command[];
  loading: boolean;
  pastryNameError: { error: boolean, duplicated: boolean } | null | undefined;
  isNameValidating: boolean;
  isSavingPastry: boolean;
  isMovingPastry: boolean;
  editingPastry: Pastry | null;
  menuModalOpened: 'new' | 'edit' | null,
}

export const initialState: AdminState = {
  allPastries: pastriesMock,
  commands: commandsMock,
  loading: false,
  pastryNameError: undefined,
  isNameValidating: false,
  isSavingPastry: false,
  isMovingPastry: false,
  editingPastry: null,
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
    const newList: Command[] = [...state.commands];
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
  on(editPastry, (state, { pastry }) => {
    const indexOf = state.allPastries.findIndex((c) => c._id === pastry._id);
    const newList: Pastry[] = [...state.allPastries];
    newList.splice(indexOf, 1, pastry);

    return {
      ...state,
      allPastries: newList,
    };
  }),
  on(reorderPastries, (state, { sequence }) => {
    const newList: Pastry[] = state.allPastries.map((pastry) => ({
      ...pastry,
      displaySequence: sequence[pastry._id],
    })).sort((a, b) => {
      return a.displaySequence - b.displaySequence;
    });

    return {
      ...state,
      allPastries: newList,
    };
  }),
  on(validatePastryName, (state) => ({
    ...state,
    pastryNameError: undefined,
    isNameValidating: true,
  })),
  on(postingPastry, (state) => ({
    ...state,
    isSavingPastry: true,
  })),
  on(pastryCreated, (state) => ({
    ...state,
    isSavingPastry: false,
  })),
  on(movingPastry, (state) => ({
    ...state,
    isMovingPastry: true,
  })),
  on(editingPastry, (state) => ({
    ...state,
    isSavingPastry: true,
  })),
  on(pastryEdited, (state) => ({
    ...state,
    isSavingPastry: false,
  })),
  on(pastryMoved, (state) => ({
    ...state,
    isMovingPastry: false,
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
  on(openMenuModal, (state, { modal, pastry }) => ({
    ...state,
    menuModalOpened: modal,
    editingPastry: pastry ?? null,
  })),
  on(closeMenuModal, (state) => ({
    ...state,
    menuModalOpened: null,
    editingPastry: null,
  })),
);

export function reducer(state: AdminState | undefined, action: Action) {
  return adminReducer(state, action);
}
