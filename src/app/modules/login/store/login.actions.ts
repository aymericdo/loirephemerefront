import { createAction, props } from '@ngrx/store';

export const postPassword = createAction(
  '[Login page] Post password',
  props<{ password: string }>()
);

export const setToken = createAction(
  '[Login page] Set token',
  props<{ token: string }>()
);
