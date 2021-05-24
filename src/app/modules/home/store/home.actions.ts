import { createAction, props } from '@ngrx/store';
import { Command } from 'src/app/interfaces/command.interface';
import { Pastry } from 'src/app/interfaces/pastry.interface';

export const fetchPastries = createAction('[Home page] Fetch pastries');
export const setPastries = createAction(
  '[Home page] Set pastries',
  props<{ pastries: Pastry[] }>()
);
export const incrementPastry = createAction(
  '[Home page] Increment pastry',
  props<{ pastry: Pastry }>()
);
export const decrementPastry = createAction(
  '[Home page] Decrement pastry',
  props<{ pastry: Pastry }>()
);
export const sendCommand = createAction(
  '[Home page] Send command',
  props<{ name: string; table: string }>()
);
export const resetCommand = createAction('[Home page] Reset command');
export const setPersonalCommand = createAction(
  '[Home page] Set personal command',
  props<{ command: Command }>()
);
