import { createAction, props } from '@ngrx/store';
import { Command, PaymentPossibility } from 'src/app/interfaces/command.interface';

export const fetchingRestaurantCommands = createAction(
  '[Commands page] Fetch commands for a restaurant',
  props<{ code: string, fromDate: string, toDate: string }>()
);
export const setCommands = createAction(
  '[Commands page] Set commands',
  props<{ commands: Command[] }>()
);
export const addCommand = createAction(
  '[Commands page] Add command',
  props<{ command: Command }>()
);
export const closingCommand = createAction(
  '[Commands page] Close command',
  props<{ command: Command }>()
);
export const cancellingCommand = createAction(
  '[Commands page] Cancelling command',
  props<{ command: Command }>()
);
export const payingCommand = createAction(
  '[Commands page] Payed command',
  props<{ command: Command, payments: PaymentPossibility[] }>()
);
export const editCommand = createAction(
  '[Commands page] Edit command',
  props<{ command: Command }>()
);
export const sendNotificationSub = createAction(
  '[Commands page] Send notification sub',
  props<{ sub: PushSubscription, code: string }>()
);
export const removeNotificationSub = createAction(
  '[Commands page] Remove notification sub',
  props<{ sub: PushSubscription, code: string }>()
);
export const notificationSubSent = createAction(
  '[Commands page] Notification sub sent'
);
export const removeNotificationSubSent = createAction(
  '[Commands page] Remove notification sub sent'
);
export const stopLoading = createAction(
  '[Commands page] Stop loading',
);
export const startLoading = createAction(
  '[Commands page] Start loading',
);
