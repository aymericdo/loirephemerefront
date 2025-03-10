import { createAction, props } from '@ngrx/store';

export const changingPassword = createAction(
  '[Profile page] Changing password',
  props<{ oldPassword: string, password: string }>(),
);

export const stopLoading = createAction(
  '[Profile page] Stop loading',
);

export const setPasswordAsChanged = createAction(
  '[Profile page] Set password as changed',
  props<{ changed: boolean }>(),
);

export const setChangePasswordError = createAction(
  '[Profile page] Set change password error',
  props<{ error: boolean }>(),
);

export const updatingDisplayDemoResto = createAction(
  '[Profile page] Updating display demo resto',
  props<{ displayDemoResto: boolean }>(),
);

export const toggleDisplayDemoResto = createAction(
  '[Profile page] Toggle display demo resto',
  props<{ displayDemoResto: boolean }>(),
);

export const toggleWaiterMode = createAction(
  '[Profile page] Toggle waiter mode',
  props<{ waiterMode: boolean }>(),
);
