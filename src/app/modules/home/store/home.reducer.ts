import { Action, createReducer, on } from '@ngrx/store';
import { Command } from 'src/app/interfaces/command.interface';
import { Pastry } from 'src/app/interfaces/pastry.interface';
import { pastriesMock } from 'src/app/mocks/pastry.mock';
import {
  decrementPastry, fetchRestaurantPastries, incrementPastry,
  resetCommand,
  resetErrorCommand,
  resetPersonalCommand,
  sendCommand,
  setErrorCommand,
  setPastries,
  setPersonalCommand,
  setStock,
  startLoading,
  stopLoading
} from './home.actions';

export const homeFeatureKey = 'home';

export interface HomeState {
  pastries: Pastry[];
  selectedPastries: { [pastryId: string]: number };
  personalCommand: Command | null;
  currentSentCommands: Command[];
  errorCommand: Object | null;
  loading: boolean;
}

export const initialState: HomeState = {
  pastries: [...pastriesMock],
  selectedPastries: {},
  personalCommand: null,
  currentSentCommands: [],
  errorCommand: null,
  loading: false,

};

const homeReducer = createReducer(
  initialState,
  on(startLoading, fetchRestaurantPastries, (state) => ({
    ...state,
    loading: true,
    pastries: [...pastriesMock],
  })),
  on(setPastries, (state, { pastries }) => ({
    ...state,
    pastries: [...pastries],
  })),
  on(stopLoading, (state) => ({
    ...state,
    loading: false,
  })),
  on(setStock, (state, { pastryId, newStock }) => {
    const indexOf = state.pastries.findIndex((p) => p.id === pastryId);
    const newList: Pastry[] = [...state.pastries];

    const editedPastry: Pastry = {
      ...(state.pastries.find((p) => p.id === pastryId) as Pastry),
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
      [pastry.id]: state.selectedPastries.hasOwnProperty(pastry.id)
        ? state.selectedPastries[pastry.id] + 1
        : 1,
    },
  })),
  on(decrementPastry, (state, { pastry }) => {
    const newStock = state.selectedPastries.hasOwnProperty(pastry.id)
      ? state.selectedPastries[pastry.id] === 0
        ? 0
        : state.selectedPastries[pastry.id] - 1
      : 0;

    const newSelectedPastries = {
      ...state.selectedPastries,
      [pastry.id]: newStock,
    };

    if (!newStock) {
      delete newSelectedPastries[pastry.id];
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
    currentSentCommands: [...state.currentSentCommands, command]
  })),
  on(resetPersonalCommand, (state) => ({
    ...state,
    personalCommand: null,
    currentSentCommands: [],
  })),
  on(setErrorCommand, (state, { error }) => ({
    ...state,
    errorCommand: error.error,
  })),
  on(resetErrorCommand, (state) => ({
    ...state,
    errorCommand: null,
  })),
);

export function reducer(state: HomeState | undefined, action: Action) {
  return homeReducer(state, action);
}
