import { createAction, props } from '@ngrx/store';
import { Command } from 'src/app/interfaces/command.interface';
import { Pastry } from 'src/app/interfaces/pastry.interface';

export const fetchingAllRestaurantPastries = createAction(
  '[Stats page] Fetch all pastries for a restaurant',
  props<{ code: string }>()
);
export const fetchingRestaurantCommands = createAction(
  '[Stats page] Fetch commands for a restaurant',
  props<{ code: string, fromDate: string, toDate: string }>()
);
export const setAllPastries = createAction(
  '[Stats page] Set all pastries',
  props<{ pastries: Pastry[] }>()
);
export const setCommands = createAction(
  '[Stats page] Set commands',
  props<{ commands: Command[] }>()
);
export const stopLoading = createAction(
  '[Stats page] Stop stats loading',
);