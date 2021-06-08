import { Action, createReducer, on } from '@ngrx/store';
import { Command } from 'src/app/interfaces/command.interface';
import { Pastry } from 'src/app/interfaces/pastry.interface';
import { pastriesMock } from 'src/app/mocks/pastry.mock';
import {
  decrementPastry,
  fetchPastries,
  incrementPastry,
  resetCommand,
  setPastries,
  setPersonalCommand,
  setTable,
} from './home.actions';

export const homeFeatureKey = 'home';

export interface HomeState {
  pastries: Pastry[];
  selectedPastries: { [pastryId: string]: number };
  personalCommand: Command | null;
  loading: boolean;
  table: string;
}

export const initialState: HomeState = {
  pastries: pastriesMock,
  selectedPastries: {},
  personalCommand: null,
  loading: false,
  table: '',
};

const homeReducer = createReducer(
  initialState,
  on(fetchPastries, (state) => ({
    ...state,
    loading: true,
  })),
  on(setPastries, (state, { pastries }) => ({
    ...state,
    pastries: [...pastries],
    loading: false,
  })),
  on(setTable, (state, { table }) => ({
    ...state,
    table,
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
  on(decrementPastry, (state, { pastry }) => {
    const newStock = state.selectedPastries.hasOwnProperty(pastry._id)
      ? state.selectedPastries[pastry._id] === 0
        ? 0
        : state.selectedPastries[pastry._id] - 1
      : 0;

    const newSelectedPastries = {
      ...state.selectedPastries,
      [pastry._id]: newStock,
    };

    if (!newStock) {
      delete newSelectedPastries[pastry._id];
    }

    return {
      ...state,
      selectedPastries: newSelectedPastries,
    };
  }),
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
