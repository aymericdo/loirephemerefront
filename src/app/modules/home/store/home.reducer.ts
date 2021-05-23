import { Action, createReducer, on } from '@ngrx/store';
import { Pastry } from 'src/app/interfaces/pastry.interface';
import { setPastries } from './home.actions';

export const homeFeatureKey = 'home';

export interface HomeState {
  pastries: Pastry[];
}

export const initialState: HomeState = {
  pastries: [],
};

const homeReducer = createReducer(
  initialState,
  on(setPastries, (state, { pastries }) => ({
    ...state,
    pastries: [...pastries],
  }))
);

export function reducer(state: HomeState | undefined, action: Action) {
  return homeReducer(state, action);
}
