import { createAction, props } from '@ngrx/store';
import { Command } from 'src/app/interfaces/command.interface';
import { CorePastry, Pastry } from 'src/app/interfaces/pastry.interface';
import { User } from 'src/app/interfaces/user.interface';

export const fetchingAllRestaurantPastries = createAction(
  '[Admin page] Fetch all pastries for a restaurant',
  props<{ code: string }>()
);
export const fetchingRestaurantCommands = createAction(
  '[Admin page] Fetch commands for a restaurant',
  props<{ code: string, fromDate: string, toDate: string }>()
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
export const validatingPastryName = createAction('[Admin page] Validate pastry name',
  props<{ pastryName: string }>()
);
export const setPastryNameError = createAction(
  '[Admin page] Set name error',
  props<{ error: boolean, duplicated: boolean }>()
);
export const setPastryNoNameError = createAction(
  '[Admin page] Set no name error',
);
export const reactivatePastryName = createAction(
  '[Admin page] Reactivate pastry name input',
);
export const postingPastry = createAction(
  '[Admin page] Posting pastry',
  props<{ pastry: CorePastry }>()
);
export const editingPastry = createAction(
  '[Admin page] Editing pastry',
  props<{ pastry: Pastry }>()
);
export const activatingPastry = createAction(
  '[Admin page] Activating pastry',
  props<{ pastry: CorePastry }>()
);
export const deactivatingPastry = createAction(
  '[Admin page] Deactivating pastry',
  props<{ pastry: CorePastry }>()
);
export const movingPastry = createAction(
  '[Admin page] Moving pastry',
  props<{ pastry: Pastry }>()
);
export const pastryCreated = createAction(
  '[Admin page] Pastry created',
);
export const pastryEdited = createAction(
  '[Admin page] Pastry edited',
);
export const addPastry = createAction(
  '[Admin page] Add pastry',
  props<{ pastry: Pastry }>()
);
export const editPastry = createAction(
  '[Admin page] Edit pastry',
  props<{ pastry: Pastry }>()
);
export const incrementPastry = createAction(
  '[Admin page] Increment pastry',
  props<{ pastry: CorePastry }>()
);
export const decrementPastry = createAction(
  '[Admin page] Decrement pastry',
  props<{ pastry: CorePastry }>()
);
export const pastryMoved = createAction(
  '[Admin page] Pastry moved',
  props<{ pastry: Pastry }>()
);
export const reorderPastries = createAction(
  '[Admin page] Reorder pastries',
  props<{ sequence: { [pastryId: string]: number } }>()
);
export const openMenuModal = createAction(
  '[Admin page] Open menu modal',
  props<{ modal: 'new' | 'edit', pastry?: Pastry }>()
);
export const closeMenuModal = createAction(
  '[Admin page] Close menu modal',
);
export const fetchingUsers = createAction(
  '[Admin page] Fetching users',
  props<{ code: string }>()
);
export const setUsers = createAction(
  '[Admin page] Set users',
  props<{ users: User[] }>()
);
export const addUser = createAction(
  '[Admin page] Add users',
  props<{ user: User }>()
);
export const deleteUser = createAction(
  '[Admin page] Delete users',
  props<{ userEmail: string }>()
);
export const validatingUserEmail = createAction(
  '[Admin page] Validating user email',
  props<{ email: string }>()
);
export const setUserEmailError = createAction(
  '[Admin page] Set user email error',
  props<{ error: boolean, notExists: boolean }>()
);
export const setUserNoEmailError = createAction(
  '[Admin page] Set no user email error',
);
export const addingUserToRestaurant = createAction(
  '[Admin page] Adding email to restaurant',
  props<{ email: string }>()
);
export const deletingUserToRestaurant = createAction(
  '[Admin page] Deleting email to restaurant',
  props<{ email: string }>()
);
