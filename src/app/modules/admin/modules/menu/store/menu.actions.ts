import { createAction, props } from '@ngrx/store';
import { CorePastry, Pastry } from 'src/app/interfaces/pastry.interface';

export const fetchingAllRestaurantPastries = createAction(
  '[Menu page] Fetch all pastries for a restaurant',
  props<{ code: string }>(),
);
export const setAllPastries = createAction(
  '[Menu page] Set all pastries',
  props<{ pastries: Pastry[] }>(),
);
export const validatingPastryName = createAction(
  '[Menu page] Validate pastry name',
  props<{ pastryName: string, pastryId?: string }>(),
);
export const setPastryNameError = createAction(
  '[Menu page] Set name error',
  props<{ error: boolean, duplicated: boolean }>(),
);
export const setPastryNoNameError = createAction(
  '[Menu page] Set no name error',
);
export const reactivatePastryName = createAction(
  '[Menu page] Reactivate pastry name input',
);
export const deactivatePastryName = createAction(
  '[Menu page] Deactivate pastry name input',
);
export const postingPastry = createAction(
  '[Menu page] Posting pastry',
  props<{ pastry: CorePastry }>(),
);
export const editingPastry = createAction(
  '[Menu page] Editing pastry',
  props<{ pastry: Pastry }>(),
);
export const activatingPastry = createAction(
  '[Menu page] Activating pastry',
  props<{ pastry: CorePastry }>(),
);
export const deactivatingPastry = createAction(
  '[Menu page] Deactivating pastry',
  props<{ pastry: CorePastry }>(),
);
export const movingPastry = createAction(
  '[Menu page] Moving pastry',
  props<{ pastry: Pastry }>(),
);
export const settingCommonStock = createAction(
  '[Menu page] Setting common stock pastries',
  props<{ commonStock: string, pastries: Pastry[] }>(),
);
export const pastryCreated = createAction(
  '[Menu page] Pastry created',
);
export const pastryEdited = createAction(
  '[Menu page] Pastry edited',
);
export const addPastry = createAction(
  '[Menu page] Add pastry',
  props<{ pastry: Pastry }>(),
);
export const editPastry = createAction(
  '[Menu page] Edit pastry',
  props<{ pastry: Pastry }>(),
);
export const incrementPastry = createAction(
  '[Menu page] Increment pastry',
  props<{ pastry: CorePastry }>(),
);
export const decrementPastry = createAction(
  '[Menu page] Decrement pastry',
  props<{ pastry: CorePastry }>(),
);
export const setStock = createAction(
  '[Menu page] Set stock',
  props<{ pastryId: string; newStock: number }>(),
);
export const pastryMoved = createAction(
  '[Menu page] Pastry moved',
  props<{ pastry: Pastry }>(),
);
export const reorderPastries = createAction(
  '[Menu page] Reorder pastries',
  props<{ sequence: { [pastryId: string]: number } }>(),
);
export const openMenuModal = createAction(
  '[Menu page] Open menu modal',
  props<{ modal: 'new' | 'edit', pastry?: Pastry }>(),
);
export const closeMenuModal = createAction(
  '[Menu page] Close menu modal',
);
export const stopLoading = createAction(
  '[Menu page] Stop loading',
);
export const startLoading = createAction(
  '[Menu page] Start loading',
);
