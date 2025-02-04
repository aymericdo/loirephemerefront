import { Action, createReducer, on } from '@ngrx/store';
import { confirmRecoverEmail, openConfirmationModal, openRecoverModal, setAuthError, setCode2, setNoAuthError, setPasswordAsChanged, setUserEmailError, setUserNoEmailError, signInUser, startLoading, stopLoading, stopLoadingAfterUnauthorizedError, validatingUserEmail } from './login.actions';

export interface LoginState {
  userEmailError: { error: boolean, duplicated: boolean } | null | undefined;
  userAuthError: { error: boolean } | null | undefined;
  isEmailValidating: boolean;
  loading: boolean;
  passwordChanged: boolean;
  code2: string | null;
  confirmationModalOpened: string;
  recoverModalOpened: boolean;
}

export const initialState: LoginState = {
  userEmailError: undefined,
  userAuthError: undefined,
  isEmailValidating: false,
  loading: false,
  passwordChanged: false,
  code2: null,
  confirmationModalOpened: '',
  recoverModalOpened: false,
};

const reducer = createReducer(
  initialState,
  on(startLoading, confirmRecoverEmail, signInUser, (state): LoginState => ({
    ...state,
    loading: true,
  })),
  on(stopLoading, stopLoadingAfterUnauthorizedError, (state): LoginState => ({
    ...state,
    loading: false,
  })),
  on(confirmRecoverEmail, (state): LoginState => ({
    ...state,
    passwordChanged: false,
  })),
  on(setCode2, (state, { code2 }): LoginState => ({
    ...state,
    code2: code2.toString(),
  })),
  on(openConfirmationModal, (state, { modal }): LoginState => ({
    ...state,
    confirmationModalOpened: modal,
  })),
  on(openRecoverModal, (state, { modal }): LoginState => ({
    ...state,
    recoverModalOpened: modal,
  })),
  on(setPasswordAsChanged, (state, { changed }): LoginState => ({
    ...state,
    passwordChanged: changed,
  })),
  on(validatingUserEmail, (state): LoginState => ({
    ...state,
    userEmailError: undefined,
  })),
  on(setUserEmailError, (state, { error, duplicated }): LoginState => ({
    ...state,
    userEmailError: { error, duplicated },
    isEmailValidating: false,
  })),
  on(setUserNoEmailError, (state): LoginState => ({
    ...state,
    userEmailError: null,
    isEmailValidating: false,
  })),
  on(signInUser, (state): LoginState => ({
    ...state,
    userAuthError: undefined,
  })),
  on(setAuthError, (state, { error }): LoginState => ({
    ...state,
    userAuthError: { error },
  })),
  on(setNoAuthError, (state): LoginState => ({
    ...state,
    userAuthError: null,
  })),
);

export function loginReducer(state: LoginState | undefined, action: Action) {
  return reducer(state, action);
}
