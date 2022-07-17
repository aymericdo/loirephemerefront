import { Action, createReducer, on } from '@ngrx/store';
import { Command } from 'src/app/interfaces/command.interface';
import { Pastry } from 'src/app/interfaces/pastry.interface';
import { pastriesMock } from 'src/app/mocks/pastry.mock';
import {
  decrementPastry,
  fetchPastries,
  incrementPastry,
  resetCommand,
  sendCommand,
  setErrorCommand,
  setPastries,
  setPersonalCommand,
  setStock,
} from './home.actions';

export const homeFeatureKey = 'home';

export interface HomeState {
  pastries: Pastry[];
  selectedPastries: { [pastryId: string]: number };
  personalCommand: Command | null;
  errorCommand: Object | null;
  loading: boolean;
}

export const initialState: HomeState = {
  pastries: pastriesMock,
  selectedPastries: {},
  personalCommand: null,
  errorCommand: null,
  loading: false,
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
  on(setStock, (state, { pastryId, newStock }) => {
    const indexOf = state.pastries.findIndex((p) => p._id === pastryId);
    const newList = [...state.pastries];

    const editedPastry: Pastry = {
      ...(state.pastries.find((p) => p._id === pastryId) as Pastry),
      stock: newStock,
    };
    newList.splice(indexOf, 1, editedPastry);

    return {
      ...state,
      pastries: newList,
    };
  }),
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
  on(sendCommand, (state) => ({
    ...state,
    personalCommand: null,
    errorCommand: null,
  })),
  on(setPersonalCommand, (state, { command }) => ({
    ...state,
    personalCommand: command,
  })),
  on(setErrorCommand, (state, { error }) => ({
    ...state,
    errorCommand: error.error,
  }))
);

export function reducer(state: HomeState | undefined, action: Action) {
  return homeReducer(state, action);
}
