import { createAction, props } from "@ngrx/store";
import { CoreUser, User } from "src/app/interfaces/user.interface";

export const stopLoading = createAction(
  '[Login page] Stop loading',
);
export const startLoading = createAction(
  '[Login page] Start loading',
);
export const confirmRecoverEmail = createAction(
  '[Login page] Confirm recover email',
  props<{ email: string, captchaToken: string }>(),
);
export const postConfirmRecoverEmailUserSuccess = createAction(
  '[Login page] Post confirm recover email user success',
  props<{ code2: string }>(),
);
export const postConfirmEmailUserSuccess = createAction(
  '[Login page] Post confirm email user success',
  props<{ code2: string }>(),
);
export const postValidateRecoverEmailCodeSuccess = createAction(
  '[Login page] Post validate recover email code success',
);
export const validateRecoverEmailCode = createAction(
  '[Login page] Validate recover email code',
  props<{ email: string, emailCode: string }>(),
);
export const openConfirmationModal = createAction(
  '[Login page] Open confirmation modal',
  props<{ modal: 'register' | 'recover' | '' }>(),
);
export const createUser = createAction(
  '[Login page] Create a new user',
  props<{ user: CoreUser, emailCode: string }>(),
);
export const postUserSuccess = createAction(
  '[Login page] Post user success',
  props<{ user: User, password: string }>(),
);
export const openRecoverModal = createAction(
  '[Login page] Open recover modal',
  props<{ modal: boolean }>(),
);
export const setCode2 = createAction(
  '[Login page] Set code 2',
  props<{ code2: string }>(),
);
export const confirmEmail = createAction(
  '[Login page] Confirm an email of a new user',
  props<{ email: string, captchaToken: string }>(),
);
export const changePassword = createAction(
  '[Login page] Change password',
  props<{ email: string, emailCode: string, password: string }>(),
);
export const postChangePasswordSuccess = createAction(
  '[Login page] Post Change Password success',
);
export const setPasswordAsChanged = createAction(
  '[Login page] Set password as changed',
  props<{ changed: boolean }>(),
);
export const validatingUserEmail = createAction(
  '[Login page] Validate user email',
  props<{ email: string }>(),
);
export const setUserEmailError = createAction(
  '[Login page] Set user email error',
  props<{ error: boolean, duplicated: boolean }>(),
);
export const setUserNoEmailError = createAction(
  '[Login page] Set no user email error',
);
export const signInUser = createAction(
  '[Login page] Sign in with a user',
  props<{ user: CoreUser }>(),
);
export const setAuthError = createAction(
  '[Login page] Set auth error',
  props<{ error: boolean }>(),
);
export const setNoAuthError = createAction(
  '[Login page] Set not user email error',
);
export const stopLoadingAfterUnauthorizedError = createAction(
  '[Login page] Stop loading after unauthorized error',
);
