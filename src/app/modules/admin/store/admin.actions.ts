import { createAction, props } from '@ngrx/store';
import { Command } from 'src/app/interfaces/command.interface';
import { Pastry } from 'src/app/interfaces/pastry.interface';

export const fetchAllRestaurantPastries = createAction(
  '[Admin page] Fetch all pastries for a restaurant',
  props<{ code: string }>()
);
export const fetchRestaurantCommands = createAction(
  '[Admin page] Fetch commands for a restaurant',
  props<{ code: string, year: string }>()
);
export const setCommands = createAction(
  '[Admin page] Set commands',
  props<{ commands: Command[] }>()
);
export const setAllPastries = createAction(
  '[Admin page] Set all pastries',
  props<{ pastries: Pastry[] }>()
);
export const addCommand = createAction(
  '[Admin page] Add command',
  props<{ command: Command }>()
);
export const closeCommand = createAction(
  '[Admin page] Close command',
  props<{ command: Command }>()
);
export const payedCommand = createAction(
  '[Admin page] Payed command',
  props<{ command: Command }>()
);
export const editCommand = createAction(
  '[Admin page] Edit command',
  props<{ command: Command }>()
);
export const sendNotificationSub = createAction(
  '[Admin page] Send notification sub',
  props<{ sub: any }>()
);
export const notificationSubSent = createAction(
  '[Admin page] Notification sub sent'
);
export const fetchRestaurant = createAction('[Admin page] Fetch restaurant',
  props<{ code: string }>()
);
