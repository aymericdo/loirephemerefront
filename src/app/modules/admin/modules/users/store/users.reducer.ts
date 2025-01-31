import { Action, createReducer, on } from '@ngrx/store';
import { User } from 'src/app/interfaces/user.interface';
import {
  addUser,
  addingUserToRestaurant,
  deleteUser,
  deletingUserToRestaurant,
  fetchingUsers,
  setUser,
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
  on(fetchingUsers, startLoading, (state): UsersState => ({
    ...state,
    loading: true,
    users: [],
  })),
  on(setUsers, (state, { users }): UsersState => ({
    ...state,
    users,
  })),
  on(setUser, (state, { user }): UsersState => ({
    ...state,
    users: [
      ...state.users.map((u) => {
        return (u.id === user.id) ? user : u;
      }),
    ],
  })),
  on(stopLoading, (state): UsersState => ({
    ...state,
    loading: false,
  })),
  on(validatingUserEmail, (state): UsersState => ({
    ...state,
    userEmailError: undefined,
  })),
  on(setUserEmailError, (state, { error, notExists }): UsersState => ({
    ...state,
    userEmailError: { error, notExists },
    isEmailValidating: false,
  })),
  on(setUserNoEmailError, (state): UsersState => ({
    ...state,
    userEmailError: null,
    isEmailValidating: false,
  })),
  on(addingUserToRestaurant, (state): UsersState => ({
    ...state,
    isAddingUser: true,
  })),
  on(deletingUserToRestaurant, (state): UsersState => ({
    ...state,
    isDeletingUser: true,
  })),
  on(addUser, (state, { user }): UsersState => ({
    ...state,
    isAddingUser: false,
    users: [...state.users, user],
  })),
  on(deleteUser, (state, { userId }): UsersState => ({
    ...state,
    isDeletingUser: false,
    users: state.users.filter(user => user.id !== userId),
  })),
);

export function reducer(state: UsersState | undefined, action: Action) {
  return usersReducer(state, action);
}
