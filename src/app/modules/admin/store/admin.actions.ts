import { createAction, props } from '@ngrx/store';
import { Command } from 'src/app/interfaces/command.interface';
import { CorePastry, Pastry } from 'src/app/interfaces/pastry.interface';

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
export const validatePastryName = createAction('[Admin page] Validate pastry name',
  props<{ pastryName: string }>()
);
export const setPastryNameError = createAction(
  '[Admin page] Set name error',
  props<{ error: boolean, duplicated: boolean }>()
);
export const setPastryNoNameError = createAction(
  '[Admin page] Set no name error',
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
  props<{ pastry: Pastry }>()
);
export const deactivatingPastry = createAction(
  '[Admin page] Deactivating pastry',
  props<{ pastry: Pastry }>()
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
