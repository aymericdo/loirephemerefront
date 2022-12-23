import { Action, createReducer, on } from '@ngrx/store';
import { Restaurant } from 'src/app/interfaces/restaurant.interface';
import { User } from 'src/app/interfaces/user.interface';
import { addUserRestaurants, confirmEmail, confirmRecoverEmail, createUser, openConfirmationModal, openRecoverModal, resetUser, setAuthError, setCode2, setNewToken, setNoAuthError, setPasswordAsChanged, setUser, setUserEmailError, setUserNoEmailError, setUserRestaurants, signInUser, stopLoading, validatingUserEmail } from './login.actions';

export const loginFeatureKey = 'login';

export interface LoginState {
  userEmailError: { error: boolean, duplicated: boolean } | null | undefined;
  userAuthError: { error: boolean } | null | undefined;
  isEmailValidating: boolean;
  user: User | null;
  userRestaurants: Restaurant[] | null;
  loading: boolean;
  code2: string | null;
  confirmationModalOpened: boolean;
  recoverModalOpened: boolean;
  passwordChanged: boolean;
}

export const initialState: LoginState = {
  userEmailError: undefined,
  userAuthError: undefined,
  isEmailValidating: false,
  user: null,
  userRestaurants: null,
  loading: false,
  code2: null,
  confirmationModalOpened: false,
  recoverModalOpened: false,
  passwordChanged: false,
};

const tokenReducer = createReducer(
  initialState,
  on(createUser, signInUser, confirmEmail, confirmRecoverEmail, (state) => ({
    ...state,
    loading: true,
  })),
  on(confirmRecoverEmail, (state) => ({
    ...state,
    passwordChanged: false,
  })),
  on(validatingUserEmail, (state) => ({
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
  on(setCode2, (state, { code2 }) => ({
    ...state,
    code2,
  })),
  on(openConfirmationModal, (state, { modal }) => ({
    ...state,
    confirmationModalOpened: modal,
  })),
  on(openRecoverModal, (state, { modal }) => ({
    ...state,
    recoverModalOpened: modal,
  })),
  on(setUser, (state, { user }) => ({
    ...state,
    user,
  })),
  on(setUserRestaurants, (state, { restaurants }) => ({
    ...state,
    userRestaurants: restaurants,
  })),
  on(addUserRestaurants, (state, { restaurant }) => ({
    ...state,
    userRestaurants: [...state.userRestaurants || [], restaurant],
  })),
  on(stopLoading, (state) => ({
    ...state,
    loading: false,
  })),
  on(setPasswordAsChanged, (state, { changed }) => ({
    ...state,
    passwordChanged: changed,
  })),
  on(resetUser, (state) => ({
    ...state,
    user: null,
    userRestaurants: null,
    userToken: null,
  })),
);

export function reducer(state: LoginState | undefined, action: Action) {
  return tokenReducer(state, action);
}
