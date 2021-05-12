import { Action, createReducer, on } from "@ngrx/store";
import { Pastry } from "src/app/interfaces/pastry.interface";
import { setPastries } from './home.actions';

export const homeFeatureKey = 'home';

export interface State {
  pastries: Pastry[];
}

export const initialState: State = {
  pastries: [],
};

const homeReducer = createReducer(
  initialState,
  on(setPastries, (state, { pastries }) => ({ ...state, pastries: [...pastries] })),
);

export function reducer(state: State | undefined, action: Action) {
  return homeReducer(state, action);
}
