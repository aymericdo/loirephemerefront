import { Action, createReducer, on } from '@ngrx/store';
import { Command } from 'src/app/interfaces/command.interface';
import { Pastry } from 'src/app/interfaces/pastry.interface';
import { pastriesMock } from 'src/app/mocks/pastry.mock';
import {
  closeHomeModal,
  decrementPastry, fetchRestaurantPastries, incrementPastry,
  openHomeModal,
  resetCommand,
  resetErrorCommand,
  resetPersonalCommand,
  sendingCommand,
  setErrorCommand,
  setPastries,
  setPersonalCommand,
  setStock,
  startLoading,
  stopLoading,
} from './home.actions';

export type HomeModalType = 'success' | 'payment';

export interface HomeState {
  pastries: Pastry[];
  selectedPastries: { [pastryId: string]: number };
  personalCommand: Command | null;
  errorCommand: Object | null;
  homeModal: HomeModalType | null;
  loading: boolean;
}

export const initialState: HomeState = {
  pastries: [...pastriesMock],
  selectedPastries: {},
  personalCommand: null,
  errorCommand: null,
  homeModal: null,
  loading: false,

};

const reducer = createReducer(
  initialState,
  on(startLoading, fetchRestaurantPastries, (state): HomeState => ({
    ...state,
    loading: true,
    pastries: [...pastriesMock],
  })),
  on(setPastries, (state, { pastries }): HomeState => ({
    ...state,
    pastries: [...pastries],
  })),
  on(stopLoading, (state): HomeState => ({
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
  on(incrementPastry, (state, { pastry }): HomeState => ({
    ...state,
    selectedPastries: {
      ...state.selectedPastries,
      [pastry.id]: state.selectedPastries.hasOwnProperty(pastry.id)
        ? state.selectedPastries[pastry.id] + 1
        : 1,
    },
  })),
  on(decrementPastry, (state, { pastry }): HomeState => {
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
  on(resetCommand, (state): HomeState => ({
    ...state,
    selectedPastries: {},
  })),
  on(sendingCommand, (state): HomeState => ({
    ...state,
    personalCommand: null,
    errorCommand: null,
  })),
  on(setPersonalCommand, (state, { command }): HomeState => ({
    ...state,
    personalCommand: command,
  })),
  on(openHomeModal, (state, { modal }): HomeState => ({
    ...state,
    homeModal: modal,
  })),
  on(closeHomeModal, (state): HomeState => ({
    ...state,
    homeModal: null,
  })),
  on(resetPersonalCommand, (state): HomeState => ({
    ...state,
    personalCommand: null,
  })),
  on(setErrorCommand, (state, { error }): HomeState => ({
    ...state,
    errorCommand: error.error,
  })),
  on(resetErrorCommand, (state): HomeState => ({
    ...state,
    errorCommand: null,
  })),
);

export function homeReducer(state: HomeState | undefined, action: Action) {
  return reducer(state, action);
}
