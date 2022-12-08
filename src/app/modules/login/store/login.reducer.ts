import { Action, createReducer, on } from '@ngrx/store';
import { Restaurant } from 'src/app/interfaces/restaurant.interface';
import { User } from 'src/app/interfaces/user.interface';
import { createUser, setAuthError, setNewToken, setNoAuthError, setUser, setUserEmailError, setUserNoEmailError, setUserRestaurants, signInUser, stopLoading, validateUserEmail } from './login.actions';

export const loginFeatureKey = 'login';

export interface LoginState {
  userEmailError: { error: boolean, duplicated: boolean } | null | undefined;
  userAuthError: { error: boolean } | null | undefined;
  isEmailValidating: boolean;
  user: User | null;
  userRestaurants: Restaurant[] | null;
  loading: boolean;
}

export const initialState: LoginState = {
  userEmailError: undefined,
  userAuthError: undefined,
  isEmailValidating: false,
  user: null,
  userRestaurants: null,
  loading: false,
};

const tokenReducer = createReducer(
  initialState,
  on(createUser, signInUser, (state) => ({
    ...state,
    loading: true,
  })),
  on(validateUserEmail, (state) => ({
    ...state,
    userEmailError: undefined,
  })),
  on(signInUser, (state) => ({
    ...state,
    userAuthError: undefined,
  })),
  on(setUserEmailError, (state, { error, duplicated }) => ({
    ...state,
    userEmailError: { error, duplicated },
    isEmailValidating: false,
  })),
  on(setNewToken, (state, { token }) => ({
    ...state,
    userToken: token,
  })),
  on(setUserNoEmailError, (state) => ({
    ...state,
    userEmailError: null,
    isEmailValidating: false,
  })),
  on(setAuthError, (state, { error }) => ({
    ...state,
    userAuthError: { error },
  })),
  on(setNoAuthError, (state) => ({
    ...state,
    userAuthError: null,
  })),
  on(setUser, (state, { user }) => ({
    ...state,
    user,
  })),
  on(setUserRestaurants, (state, { restaurants }) => ({
    ...state,
    userRestaurants: restaurants,
  })),
  on(stopLoading, (state) => ({
    ...state,
    loading: false,
  })),
);

export function reducer(state: LoginState | undefined, action: Action) {
  return tokenReducer(state, action);
}
