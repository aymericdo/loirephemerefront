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
  props<{ name: string }>()
);
export const resetCommand = createAction('[Home page] Reset command');
export const setPersonalCommand = createAction(
  '[Home page] Set personal command',
  props<{ command: Command }>()
);
export const setErrorCommand = createAction(
  '[Home page] Set error command',
  props<{ error: any }>()
);
export const setStock = createAction(
  '[Home page] Set stock',
  props<{ pastryId: string; newStock: number }>()
);
export const sendNotificationSub = createAction(
  '[Home page] Send notification sub',
  props<{ commandId: string; sub: any }>()
);
export const notificationSubSent = createAction(
  '[Home page] Notification sub sent'
);
