import { createAction, props } from '@ngrx/store';
import { CoreUser, User } from 'src/app/interfaces/user.interface';

export const postPassword = createAction(
  '[Login page] Post password',
  props<{ password: string }>()
);

export const setToken = createAction(
  '[Login page] Set token',
  props<{ token: string }>()
);

export const setNewUser = createAction(
  '[Login page] Set User',
  props<{ user: User }>()
);

export const validateUserEmail = createAction(
  '[Login page] Validate user email',
  props<{ email: string }>()
);

export const setUserEmailError = createAction(
  '[Login page] Set user email error',
  props<{ error: boolean, duplicated: boolean }>()
);

export const setUserNoEmailError = createAction(
  '[Login page] Set no user email error',
);

export const createUser = createAction(
  '[Login page] Create a new user',
  props<{ user: CoreUser }>()
);
