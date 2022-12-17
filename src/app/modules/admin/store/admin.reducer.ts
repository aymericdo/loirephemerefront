import { Action, createReducer, on } from '@ngrx/store';
import { Command } from 'src/app/interfaces/command.interface';
import { Pastry } from 'src/app/interfaces/pastry.interface';
import { User } from 'src/app/interfaces/user.interface';
import { commandsMock } from 'src/app/mocks/commands.mock';
import { pastriesMock } from 'src/app/mocks/pastry.mock';
import {
  addCommand,
  editCommand,
  setCommands,
  fetchingRestaurantCommands,
  fetchingRestaurant,
  setAllPastries,
  fetchingAllRestaurantPastries,
  validatingPastryName,
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
  reactivatePastryName,
  setUsers,
  fetchingUsers,
  validatingUserEmail,
  setUserEmailError,
  setUserNoEmailError,
  addingUserToRestaurant,
  addUser,
  deleteUser,
  deletingUserToRestaurant,
} from './admin.actions';

export const adminFeatureKey = 'admin';

export interface AdminState {
  allPastries: Pastry[];
  commands: Command[];
  loading: boolean;
  pastryNameError: { error: boolean, duplicated: boolean } | null | undefined;
  pastryNameDeactivated: boolean;
  isNameValidating: boolean;
  isSavingPastry: boolean;
  isMovingPastry: boolean;
  editingPastry: Pastry | null;
  menuModalOpened: 'new' | 'edit' | null,
  users: User[],
  userEmailError: { error: boolean, notExists: boolean } | null | undefined;
  isEmailValidating: boolean;
  isAddingUser: boolean;
  isDeletingUser: boolean;
}

export const initialState: AdminState = {
  allPastries: pastriesMock,
  commands: commandsMock,
  loading: false,
  pastryNameError: undefined,
  pastryNameDeactivated: true,
  isNameValidating: false,
  isSavingPastry: false,
  isMovingPastry: false,
  editingPastry: null,
  menuModalOpened: null,
  users: [],
  userEmailError: undefined,
  isEmailValidating: false,
  isAddingUser: false,
  isDeletingUser: false,
};

const adminReducer = createReducer(
  initialState,

  // Common
  on(fetchingAllRestaurantPastries, fetchingRestaurant, fetchingRestaurantCommands, fetchingUsers, (state) => ({
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
  on(reactivatePastryName, (state) => ({
    ...state,
    pastryNameDeactivated: false,
  })),
  on(validatingPastryName, (state) => ({
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

  // Users
  on(setUsers, (state, { users }) => ({
    ...state,
    users,
    loading: false,
  })),
  on(validatingUserEmail, (state) => ({
    ...state,
    userEmailError: undefined,
  })),
  on(setUserEmailError, (state, { error, notExists }) => ({
    ...state,
    userEmailError: { error, notExists },
    isEmailValidating: false,
  })),
  on(setUserNoEmailError, (state) => ({
    ...state,
    userEmailError: null,
    isEmailValidating: false,
  })),
  on(addingUserToRestaurant, (state) => ({
    ...state,
    isAddingUser: true,
  })),
  on(deletingUserToRestaurant, (state) => ({
    ...state,
    isDeletingUser: true,
  })),
  on(addUser, (state, { user }) => ({
    ...state,
    isAddingUser: false,
    users: [...state.users, user],
  })),
  on(deleteUser, (state, { userEmail }) => ({
    ...state,
    isDeletingUser: false,
    users: state.users.filter(user => user.email !== userEmail),
  })),
);

export function reducer(state: AdminState | undefined, action: Action) {
  return adminReducer(state, action);
}
