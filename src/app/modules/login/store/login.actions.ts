import { createAction, props } from '@ngrx/store';
import { Restaurant } from 'src/app/interfaces/restaurant.interface';
import { CoreUser, User } from 'src/app/interfaces/user.interface';

export const fetchUser = createAction(
  '[Login page] Fetch User',
);

export const fetchUserRestaurant = createAction(
  '[Login page] Fetch user restaurant',
);

export const setUserRestaurants = createAction(
  '[Login page] Set user restaurants',
  props<{ restaurants: Restaurant[] }>()
);

export const setUser = createAction(
  '[Login page] Set User',
  props<{ user: User }>()
);

export const setAuthError = createAction(
  '[Login page] Set auth error',
  props<{ error: boolean }>()
);

export const validateUserEmail = createAction(
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
  props<{ user: CoreUser }>()
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
