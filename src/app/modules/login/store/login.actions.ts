import { createAction, props } from '@ngrx/store';
import { Restaurant } from 'src/app/interfaces/restaurant.interface';
import { CoreUser, User } from 'src/app/interfaces/user.interface';

export const fetchingUser = createAction(
  '[Login page] Fetching User',
);

export const fetchingUserRestaurants = createAction(
  '[Login page] Fetching user restaurant',
);

export const setUserRestaurants = createAction(
  '[Login page] Set user restaurants',
  props<{ restaurants: Restaurant[] }>()
);

export const addUserRestaurants = createAction(
  '[Login page] Add user restaurant',
  props<{ restaurant: Restaurant }>()
);

export const setUser = createAction(
  '[Login page] Set User',
  props<{ user: User }>()
);

export const resetUser = createAction(
  '[Login page] Reset User',
);

export const setAuthError = createAction(
  '[Login page] Set auth error',
  props<{ error: boolean }>()
);

export const validatingUserEmail = createAction(
  '[Login page] Validate user email',
  props<{ email: string }>()
);

export const setUserEmailError = createAction(
  '[Login page] Set user email error',
  props<{ error: boolean, duplicated: boolean }>()
);

export const setNoAuthError = createAction(
  '[Login page] Set not user email error',
);

export const setUserNoEmailError = createAction(
  '[Login page] Set no user email error',
);

export const createUser = createAction(
  '[Login page] Create a new user',
  props<{ user: CoreUser, emailCode: string }>()
);

export const confirmEmail = createAction(
  '[Login page] Confirm an email of a new user',
  props<{ email: string }>()
);

export const setCode2 = createAction(
  '[Login page] Set code 2',
  props<{ code2: string }>()
);

export const openConfirmationModal = createAction(
  '[Admin page] Open confirmation modal',
  props<{ modal: boolean }>()
);

export const openRecoverModal = createAction(
  '[Admin page] Open recover modal',
  props<{ modal: boolean }>()
);

export const signInUser = createAction(
  '[Login page] Sign in with a user',
  props<{ user: CoreUser }>()
);

export const setNewToken = createAction(
  '[Login page] Set user token',
  props<{ token: string }>()
);

export const stopLoading = createAction(
  '[Login page] Stop loading',
);

export const confirmRecoverEmail = createAction(
  '[Login page] Confirm recover email',
  props<{ email: string }>()
);

export const validateRecoverEmailCode = createAction(
  '[Login page] Validate recover email code',
  props<{ email: string, emailCode: string }>()
);

export const changePassword = createAction(
  '[Login page] Change password',
  props<{ email: string, emailCode: string, password: string }>()
);

export const setPasswordAsChanged = createAction(
  '[Login page] Set password as changed',
  props<{ changed: boolean }>()
);
