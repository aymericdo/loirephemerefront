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

const reducer = createReducer(
  statsInitialState,
  on(startLoading, fetchingAllRestaurantPastries, fetchingRestaurantCommands, (state): StatsState => ({
    ...state,
    loading: true,
  })),
  on(fetchingAllRestaurantPastries, (state): StatsState => ({
    ...state,
    allPastries: [...pastriesMock],
  })),
  on(fetchingRestaurantCommands, (state): StatsState => ({
    ...state,
    commands: [...commandsMock],
  })),
  on(setAllPastries, (state, { pastries }): StatsState => ({
    ...state,
    allPastries: [...pastries],
  })),
  on(setCommands, (state, { commands }): StatsState => ({
    ...state,
    commands: [...commands],
  })),
  on(setTimeInterval, (state, { timeInterval }): StatsState => ({
    ...state,
    timeInterval,
  })),
  on(resetTimeInterval, (state): StatsState => ({
    ...state,
    timeInterval: statsInitialState.timeInterval,
  })),
  on(stopLoading, (state): StatsState => ({
    ...state,
    loading: false,
  })),
);

export function statsReducer(state: StatsState | undefined, action: Action) {
  return reducer(state, action);
}
