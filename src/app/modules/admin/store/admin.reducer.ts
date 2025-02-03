import { Action, createReducer, on } from '@ngrx/store';
import { stopLoading } from './admin.actions';

export interface AdminState {
  loading: boolean;
}

export const initialState: AdminState = {
  loading: false,
};

const adminReducer = createReducer(
  initialState,
  on(stopLoading, (state): AdminState => ({
    ...state,
    loading: false,
  })),
);

export function reducer(state: AdminState | undefined, action: Action) {
  return adminReducer(state, action);
}
