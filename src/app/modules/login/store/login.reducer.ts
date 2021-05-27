import { Action, createReducer, on } from '@ngrx/store';
import { setToken } from './login.actions';

export const loginFeatureKey = 'login';

export interface LoginState {
  token: string;
}

export const initialState: LoginState = {
  token: '',
};

const tokenReducer = createReducer(
  initialState,
  on(setToken, (state, { token }) => ({
    ...state,
    token: token,
  }))
);

export function reducer(state: LoginState | undefined, action: Action) {
  return tokenReducer(state, action);
}
