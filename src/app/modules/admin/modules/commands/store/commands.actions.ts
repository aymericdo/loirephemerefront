import { createAction, props } from '@ngrx/store';
import { Command, PaymentPossibility } from 'src/app/interfaces/command.interface';
import { Discount } from 'src/app/modules/admin/modules/commands/components/promo-modal/promo-modal.component';

export const fetchingRestaurantCommands = createAction(
  '[Commands page] Fetch commands for a restaurant',
  props<{ code: string, fromDate: string, toDate: string }>(),
);
export const getCommandsSuccess = createAction(
  '[Commands page] Get commands success',
  props<{ commands: Command[] }>(),
);
export const setCommands = createAction(
  '[Commands page] Set commands',
  props<{ commands: Command[] }>(),
);
export const addCommand = createAction(
  '[Commands page] Add command',
  props<{ command: Command }>(),
);
export const closingCommand = createAction(
  '[Commands page] Close command',
  props<{ command: Command }>(),
);
export const cancellingCommand = createAction(
  '[Commands page] Cancelling command',
  props<{ command: Command }>(),
);
export const payingCommand = createAction(
  '[Commands page] Payed command',
  props<{ command: Command, payments: PaymentPossibility[], discount: Discount }>(),
);
export const editCommand = createAction(
  '[Commands page] Edit command',
  props<{ command: Command }>(),
);
export const mergeCommands = createAction(
  '[Commands page] Merge commands',
  props<{ commands: Command[] }>(),
);
export const splitCommands = createAction(
  '[Commands page] Split commands',
  props<{ commands: Command[] }>(),
);
export const mergingCommands = createAction(
  '[Commands page] Merging commands',
  props<{ commandIds: string[] }>(),
);
export const splittingCommands = createAction(
  '[Commands page] Splitting commands',
  props<{ commandIds: string[] }>(),
);
export const sendNotificationSub = createAction(
  '[Commands page] Send notification sub',
  props<{ sub: PushSubscription, code: string }>(),
);
export const setNotificationSub = createAction(
  '[Commands page] Set admin sub',
  props<{ sub: PushSubscription }>(),
);
export const removeNotificationSub = createAction(
  '[Commands page] Remove notification sub',
  props<{ code: string }>(),
);
export const stopLoading = createAction(
  '[Commands page] Stop loading',
);
export const deleteSub = createAction(
  '[Commands page] Subscription deleted',
);
export const startLoading = createAction(
  '[Commands page] Start loading',
);
