import { createAction, props } from '@ngrx/store';
import { Command } from 'src/app/interfaces/command.interface';
import { Pastry } from 'src/app/interfaces/pastry.interface';

export const fetchingAllRestaurantPastries = createAction(
  '[Stats page] Fetch all pastries for a restaurant',
  props<{ code: string }>(),
);
export const fetchingRestaurantCommands = createAction(
  '[Stats page] Fetch commands for a restaurant',
  props<{ code: string, fromDate: string, toDate: string }>(),
);
export const setAllPastries = createAction(
  '[Stats page] Set all pastries',
  props<{ pastries: Pastry[] }>(),
);
export const setCommands = createAction(
  '[Stats page] Set commands',
  props<{ commands: Command[] }>(),
);
export const setTimeInterval = createAction(
  '[Stats page] Set Time Interval',
  props<{ timeInterval: 'day' | 'month' }>(),
);
export const resetTimeInterval = createAction(
  '[Stats page] Reset Time Interval',
);
export const stopLoading = createAction(
  '[Stats page] Stop stats loading',
);
export const startLoading = createAction(
  '[Stats page] Start stats loading',
);
