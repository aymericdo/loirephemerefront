import { createAction, props } from '@ngrx/store';
import { Command } from 'src/app/interfaces/command.interface';

export const fetchingRestaurantCommands = createAction(
  '[Admin page] Fetch commands for a restaurant',
  props<{ code: string, fromDate: string, toDate: string }>()
);
export const setCommands = createAction(
  '[Admin page] Set commands',
  props<{ commands: Command[] }>()
);
export const addCommand = createAction(
  '[Admin page] Add command',
  props<{ command: Command }>()
);
export const closingCommand = createAction(
  '[Admin page] Close command',
  props<{ command: Command }>()
);
export const payingCommand = createAction(
  '[Admin page] Payed command',
  props<{ command: Command }>()
);
export const editCommand = createAction(
  '[Admin page] Edit command',
  props<{ command: Command }>()
);
export const sendNotificationSub = createAction(
  '[Admin page] Send notification sub',
  props<{ sub: PushSubscription, code: string }>()
);
export const removeNotificationSub = createAction(
  '[Admin page] Remove notification sub',
  props<{ sub: PushSubscription, code: string }>()
);
export const notificationSubSent = createAction(
  '[Admin page] Notification sub sent'
);
export const removeNotificationSubSent = createAction(
  '[Admin page] Remove notification sub sent'
);
export const fetchingRestaurant = createAction('[Admin page] Fetch restaurant',
  props<{ code: string }>()
);
export const stopLoading = createAction(
  '[Admin page] Stop loading',
);
