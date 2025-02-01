import { Action, createReducer, on } from '@ngrx/store';
import { changingPassword, setChangePasswordError, setPasswordAsChanged, stopLoading } from './profile.actions';

export interface ProfileState {
  loading: boolean;
  passwordChanged: boolean | undefined;
  changePasswordError: { error: boolean } | null | undefined;
}

export const initialState: ProfileState = {
  loading: false,
  passwordChanged: false,
  changePasswordError: undefined,
};

const profileReducer = createReducer(
  initialState,
  on(changingPassword, (state): ProfileState => ({
    ...state,
    loading: true,
    passwordChanged: undefined,
  })),
  on(stopLoading, (state): ProfileState => ({
    ...state,
    loading: false,
  })),
  on(setPasswordAsChanged, (state, { changed }): ProfileState => ({
    ...state,
    passwordChanged: changed,
  })),
  on(setChangePasswordError, (state, { error }): ProfileState => ({
    ...state,
    changePasswordError: { error },
  })),
);

export function reducer(state: ProfileState | undefined, action: Action) {
  return profileReducer(state, action);
}
