import { Action, createReducer, on } from '@ngrx/store';
import { Command } from 'src/app/interfaces/command.interface';
import { Pastry } from 'src/app/interfaces/pastry.interface';
import {
  decrementPastry,
  incrementPastry,
  resetCommand,
  setPastries,
  setPersonalCommand,
} from './home.actions';

export const homeFeatureKey = 'home';

export interface HomeState {
  pastries: Pastry[];
  selectedPastries: { [pastryId: string]: number };
  personalCommand: Command | null;
}

export const initialState: HomeState = {
  pastries: [],
  selectedPastries: {},
  personalCommand: null,
};

const homeReducer = createReducer(
  initialState,
  on(setPastries, (state, { pastries }) => ({
    ...state,
    pastries: [...pastries],
  })),
  on(incrementPastry, (state, { pastry }) => ({
    ...state,
    selectedPastries: {
      ...state.selectedPastries,
      [pastry._id]: state.selectedPastries.hasOwnProperty(pastry._id)
        ? state.selectedPastries[pastry._id] + 1
        : 1,
    },
  })),
  on(decrementPastry, (state, { pastry }) => ({
    ...state,
    selectedPastries: {
      ...state.selectedPastries,
      [pastry._id]: state.selectedPastries.hasOwnProperty(pastry._id)
        ? state.selectedPastries[pastry._id] === 0
          ? 0
          : state.selectedPastries[pastry._id] - 1
        : 0,
    },
  })),
  on(resetCommand, (state) => ({
    ...state,
    selectedPastries: {},
  })),
  on(setPersonalCommand, (state, { command }) => ({
    ...state,
    personalCommand: command,
  }))
);

export function reducer(state: HomeState | undefined, action: Action) {
  return homeReducer(state, action);
}
