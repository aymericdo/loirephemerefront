import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { LoginApiService } from 'src/app/modules/login/services/login-api.service';
import { concatMap, map, catchError, debounceTime, switchMap } from 'rxjs';
import {
  changePassword, confirmEmail, confirmRecoverEmail, createUser,
  openConfirmationModal, openRecoverModal, postChangePasswordSuccess,
  postConfirmEmailUserSuccess, postConfirmRecoverEmailUserSuccess,
  postUserSuccess, postValidateRecoverEmailCodeSuccess, setAuthError,
  setCode2, setNoAuthError, setPasswordAsChanged, setUserEmailError,
  setUserNoEmailError, signInUser, stopLoading, stopLoadingAfterUnauthorizedError,
  validateRecoverEmailCode, validatingUserEmail,
} from 'src/app/modules/login/store/login.actions';
import { concatLatestFrom } from '@ngrx/operators';
import { setNewToken } from 'src/app/auth/store/auth.actions';
import { CoreUser } from 'src/app/interfaces/user.interface';
import { selectCode2 } from 'src/app/modules/login/store/login.selectors';

@Injectable()
export class LoginEffects {
  confirmRecoverEmail$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(confirmRecoverEmail),
      concatMap((action: { email: string, captchaToken: string }) => {
        return this.loginApiService.postConfirmRecoverEmailUser(action.email, action.captchaToken).pipe(
          map((code2: string) => postConfirmRecoverEmailUserSuccess({ code2 })),
          catchError(() => [stopLoading()]),
        );
      }),
    );
  });

  setCode2$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(postConfirmEmailUserSuccess, postConfirmRecoverEmailUserSuccess),
      map(({ code2 }) => setCode2({ code2 })),
    );
  });

  openRecoverConfirmationModal$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(postConfirmRecoverEmailUserSuccess, postValidateRecoverEmailCodeSuccess),
      map(() => openConfirmationModal({ modal: 'recover' })),
    );
  });

  confirmEmail$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(confirmEmail),
      concatMap((action: { email: string, captchaToken: string }) => {
        return this.loginApiService.postConfirmEmailUser(action.email, action.captchaToken).pipe(
          map((code2: string) => postConfirmEmailUserSuccess({ code2 })),
          catchError(() => [stopLoading()]),
        );
      }),
    );
  });

  openRegisterConfirmationModal$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(postConfirmEmailUserSuccess),
      map(() => openConfirmationModal({ modal: 'register' })),
    );
  });

   validateRecoverEmailCode$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(validateRecoverEmailCode),
      concatLatestFrom(() => this.store.select(selectCode2)),
      concatMap(([action, code2]) => {
        const { email, emailCode }: { email: string, emailCode: string } =
          action as { email: string, emailCode: string };
        return this.loginApiService.postValidateRecoverEmailCode(email, emailCode, code2!).pipe(
          map((isValid: boolean) => {
            return (isValid) ?
              postValidateRecoverEmailCodeSuccess() :
              stopLoading();
          }),
          catchError(() => [stopLoading()]),
        );
      }),
    );
  });

  postUser$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(createUser),
      concatLatestFrom(() => this.store.select(selectCode2)),
      concatMap(([action, code2]) => {
        const { user, emailCode }: { user: CoreUser, emailCode: string } =
          action as { user: CoreUser, emailCode: string };
        return this.loginApiService.postUser(user, emailCode, code2!).pipe(
          map((data) => {
            return postUserSuccess({ user: data, password: user.password });
          }),
          catchError(() => {
            return [stopLoading()];
          }),
        );
      }),
    );
  });

  closeConfirmationModal$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(postUserSuccess),
      map(() => openConfirmationModal({ modal: ''  })),
    );
  });

  signInAfterCreationUser$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(postUserSuccess),
      map(({ user, password }) => signInUser({ user: { email: user.email, password } })),
    );
  });

  openRecoverModal$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(postValidateRecoverEmailCodeSuccess),
      map(() => openRecoverModal({ modal: true })),
    );
  });

  changePassword$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(changePassword),
      concatLatestFrom(() => this.store.select(selectCode2)),
      concatMap(([action, code2]) => {
        const { email, password, emailCode }: { email: string, password: string, emailCode: string } = action;
        return this.loginApiService.postChangePassword(email, password, emailCode, code2!).pipe(
          map((isValid: boolean) => {
            if (isValid) {
              return postChangePasswordSuccess();
            } else {
              return stopLoading();
            }
          }),
          catchError(() => {
            return [stopLoading()];
          }),
        );
      }),
    );
  });

  closeRecoverModal$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(postChangePasswordSuccess),
      map(() => openRecoverModal({ modal: false })),
    );
  });

  setPasswordAsChanged$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(postChangePasswordSuccess),
      map(() => setPasswordAsChanged({ changed: true })),
    );
  });

  validatingUserEmail$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(validatingUserEmail),
      debounceTime(500),
      switchMap((action: { email: string }) => {
        return this.loginApiService.validateUserEmail(action.email).pipe(
          map((isValid: boolean) => {
            if (isValid) {
              return setUserNoEmailError();
            } else {
              return setUserEmailError({ error: true, duplicated: true });
            }
          }),
        );
      }),
    );
  });

  signInUser$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(signInUser),
      switchMap((action: { user: CoreUser }) => {
        return this.loginApiService.postAuthLogin(action.user).pipe(
          map((token: { access_token: string }) => {
            localStorage.setItem('access_token', token.access_token);
            return setNewToken({ token: token.access_token });
          }),
          catchError((error) => {
            if (error.status === 401) {
              localStorage.removeItem('access_token');
              return [stopLoadingAfterUnauthorizedError()];
            }

            return [stopLoading()];
          }),
        );
      }),
    );
  });

  setAuthError$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(stopLoadingAfterUnauthorizedError),
      map(() => setAuthError({ error: true })),
    );
  });

  setNoAuthError$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(setNewToken),
      map(() => setNoAuthError()),
    );
  });

  stopLoading$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(
        setCode2,
        postValidateRecoverEmailCodeSuccess,
        postChangePasswordSuccess,
      ),
      map(() => stopLoading()),
    );
  });

  constructor(
    private actions$: Actions,
    private store: Store,
    private loginApiService: LoginApiService,
  ) { }
}
