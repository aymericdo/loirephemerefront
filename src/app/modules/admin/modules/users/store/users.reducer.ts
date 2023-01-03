import { Action, createReducer, on } from '@ngrx/store';
import { User } from 'src/app/interfaces/user.interface';
import {
  addUser,
  addingUserToRestaurant,
  deleteUser,
  deletingUserToRestaurant,
  fetchingUsers,
  setUserEmailError,
  setUserNoEmailError,
  setUsers,
  startLoading,
  stopLoading,
  validatingUserEmail,
} from 'src/app/modules/admin/modules/users/store/users.actions';

export const usersFeatureKey = 'users';

export interface UsersState {
  users: User[],
  loading: boolean;
  userEmailError: { error: boolean, notExists: boolean } | null | undefined;
  isEmailValidating: boolean;
  isAddingUser: boolean;
  isDeletingUser: boolean;
}

export const usersInitialState: UsersState = {
  users: [],
  loading: false,
  userEmailError: undefined,
  isEmailValidating: false,
  isAddingUser: false,
  isDeletingUser: false,
};

const usersReducer = createReducer(
  usersInitialState,
  on(fetchingUsers, startLoading, (state) => ({
    ...state,
    loading: true,
    users: [],
  })),
  on(setUsers, (state, { users }) => ({
    ...state,
    users,
  })),
  on(stopLoading, (state) => ({
    ...state,
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

export function reducer(state: UsersState | undefined, action: Action) {
  return usersReducer(state, action);
}
