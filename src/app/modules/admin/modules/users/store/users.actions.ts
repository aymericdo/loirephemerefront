import { createAction, props } from '@ngrx/store';
import { Access, User } from 'src/app/interfaces/user.interface';

export const fetchingUsers = createAction(
  '[Users page] Fetching users',
  props<{ code: string }>(),
);
export const setUsers = createAction(
  '[Users page] Set users',
  props<{ users: User[] }>(),
);
export const addUser = createAction(
  '[Users page] Add users',
  props<{ user: User }>(),
);
export const setUser = createAction(
  '[Users page] Set user',
  props<{ user: User }>(),
);
export const patchUserRestaurantAccessSuccess = createAction(
  '[Users page] Patch user restaurant access user success',
  props<{ user: User }>(),
);
export const deleteUser = createAction(
  '[Users page] Delete users',
  props<{ userId: string }>(),
);
export const validatingUserEmail = createAction(
  '[Users page] Validating user email',
  props<{ email: string }>(),
);
export const setUserEmailError = createAction(
  '[Users page] Set user email error',
  props<{ error: boolean, notExists: boolean }>(),
);
export const setUserNoEmailError = createAction(
  '[Users page] Set no user email error',
);
export const addingUserToRestaurant = createAction(
  '[Users page] Adding email to restaurant',
  props<{ email: string }>(),
);
export const deletingUserToRestaurant = createAction(
  '[Users page] Deleting email to restaurant',
  props<{ userId: string }>(),
);
export const patchingUserRestaurantAccess = createAction(
  '[Users page] Patching user restaurant access',
  props<{ userId: string, access: Access[] }>(),
);
export const stopLoading = createAction(
  '[Users page] Stop loading',
);
export const startLoading = createAction(
  '[Users page] Start loading',
);
