import { Action, createReducer, on } from '@ngrx/store';
import { Command } from 'src/app/interfaces/command.interface';
import { Pastry } from 'src/app/interfaces/pastry.interface';
import { commandsMock } from 'src/app/mocks/commands.mock';
import { pastriesMock } from 'src/app/mocks/pastry.mock';
import {
  fetchingAllRestaurantPastries,
  fetchingRestaurantCommands,
  resetTimeInterval,
  setAllPastries,
  setCommands,
  setTimeInterval,
  startLoading,
  stopLoading,
} from './stats.actions';

export const statsFeatureKey = 'stats';

export interface StatsState {
  allPastries: Pastry[];
  commands: Command[];
  loading: boolean;
  timeInterval: 'day' | 'month';
}

export const statsInitialState: StatsState = {
  allPastries: [...pastriesMock],
  commands: [...commandsMock],
  loading: false,
  timeInterval: 'day',
};

const statsReducer = createReducer(
  statsInitialState,
  on(startLoading, fetchingAllRestaurantPastries, fetchingRestaurantCommands, (state) => ({
    ...state,
    loading: true,
  })),
  on(fetchingAllRestaurantPastries, (state) => ({
    ...state,
    allPastries: [...pastriesMock],
  })),
  on(fetchingRestaurantCommands, (state) => ({
    ...state,
    commands: [...commandsMock],
  })),
  on(setAllPastries, (state, { pastries }) => ({
    ...state,
    allPastries: [...pastries],
  })),
  on(setCommands, (state, { commands }) => ({
    ...state,
    commands: [...commands],
  })),
  on(setTimeInterval, (state, { timeInterval }) => ({
    ...state,
    timeInterval,
  })),
  on(resetTimeInterval, (state) => ({
    ...state,
    timeInterval: statsInitialState.timeInterval,
  })),
  on(stopLoading, (state) => ({
    ...state,
    loading: false,
  })),
);

export function reducer(state: StatsState | undefined, action: Action) {
  return statsReducer(state, action);
}
