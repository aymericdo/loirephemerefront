import { Action, createReducer, on } from '@ngrx/store';
import { setToken, setUserEmailError, setUserNoEmailError, validateUserEmail } from './login.actions';

export const loginFeatureKey = 'login';

export interface LoginState {
  token: string;
  userEmailError: { error: boolean, duplicated: boolean } | null | undefined;
  isEmailValidating: boolean;
}

export const initialState: LoginState = {
  token: '',
  userEmailError: undefined,
  isEmailValidating: false,
};

const tokenReducer = createReducer(
  initialState,
  on(setToken, (state, { token }) => ({
    ...state,
    token: token,
  })),
  on(validateUserEmail, (state) => ({
    ...state,
    userEmailError: undefined,
  })),
  on(setUserEmailError, (state, { error, duplicated }) => ({
    ...state,
    userEmailError: { error, duplicated },
    isEmailValidating: false,
  })),
  on(setUserNoEmailError, (state) => ({
    ...state,
    userEmailError: null,
    isEmailValidating: false,
  })),
);

export function reducer(state: LoginState | undefined, action: Action) {
  return tokenReducer(state, action);
}
