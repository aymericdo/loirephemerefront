import { Action, createReducer, on } from '@ngrx/store';
import {
  setCommandsCount,
  setPayedCommandsCount,
  setUsersCount,
  startLoading,
  stopLoading,
} from './dashboard.actions';

export interface DashboardState {
  loading: boolean;
  usersCount: number;
  commandsCount: number;
  payedCommandsCount: number;
}

export const dashboardInitialState: DashboardState = {
  loading: false,
  usersCount: 0,
  commandsCount: 0,
  payedCommandsCount: 0,
};

const adminDashboardReducer = createReducer(
  dashboardInitialState,
  on(stopLoading, (state): DashboardState => ({
    ...state,
    loading: false,
  })),
  on(startLoading, (state): DashboardState => ({
    ...state,
    loading: true,
  })),
  on(setUsersCount, (state, { usersCount }): DashboardState => ({
    ...state,
    usersCount,
  })),
  on(setCommandsCount, (state, { commandsCount }): DashboardState => ({
    ...state,
    commandsCount,
  })),
  on(setPayedCommandsCount, (state, { payedCommandsCount }): DashboardState => ({
    ...state,
    payedCommandsCount,
  })),
);

export function dashboardReducer(state: DashboardState | undefined, action: Action) {
  return adminDashboardReducer(state, action);
}
