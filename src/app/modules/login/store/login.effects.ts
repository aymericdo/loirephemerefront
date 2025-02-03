import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { catchError, concatMap, debounceTime, filter, map, switchMap } from 'rxjs/operators';
import { Restaurant } from 'src/app/interfaces/restaurant.interface';
import { CoreUser } from 'src/app/interfaces/user.interface';
import { LoginApiService } from 'src/app/modules/login/services/login-api.service';
import { selectCode2, selectRestaurant } from 'src/app/modules/login/store/login.selectors';
import { RestaurantApiService } from 'src/app/modules/restaurant/services/restaurant-api.service';
import {
  changePassword, confirmEmail, confirmRecoverEmail,
  createUser, fetchingCurrentRestaurantPublicKey, fetchingDemoResto,
  fetchingRestaurant, fetchingUser, getUserSuccess,
  openConfirmationModal, openRecoverModal, postChangePasswordSuccess, postConfirmEmailUserSuccess,
  postConfirmRecoverEmailUserSuccess, postUserSuccess, postValidateRecoverEmailCodeSuccess,
  refreshingUser, setAuthError,
  setCode2, setDemoResto, setNewToken, setNoAuthError,
  setPasswordAsChanged, setRestaurant, setRestaurantPublicKey, setUser, setUserEmailError,
  setUserNoEmailError, setUserRestaurants, signInUser,
  startFirstNavigation, stopDemoRestoFetching, stopLoading, stopLoadingAfterUnauthorizedError,
  stopRestaurantFetching, stopUserFetching,
  validateRecoverEmailCode, validatingUserEmail,
} from './login.actions';
import { startLoading } from 'src/app/modules/home/store/home.actions';
import { EMPTY } from 'rxjs';
import { concatLatestFrom } from '@ngrx/operators';

@Injectable()
export class LoginEffects {
  startFirstNavigation$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(startFirstNavigation),
      map(() => fetchingDemoResto()),
    );
  });

  fetchingUser$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(fetchingUser),
      concatMap(() => {
        return this.loginApiService.getUser().pipe(
          map((user) => getUserSuccess({ user })),
          catchError(() => [stopUserFetching()]),
        );
      }),
    );
  });

  setUser$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(getUserSuccess, postUserSuccess),
      map(({ user }) => setUser({ user })),
    );
  });

  stopLoading$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(
        getUserSuccess,
        stopUserFetching,
        setCode2,
        postValidateRecoverEmailCodeSuccess,
        postChangePasswordSuccess,
        setRestaurant,
      ),
      map(() => stopLoading()),
    );
  });

  refreshingUser$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(refreshingUser),
      concatMap(() => {
        return this.loginApiService.getUser().pipe(
          map((user) => setUser({ user })),
        );
      }),
    );
  });

  fetchingUserRestaurants$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(getUserSuccess),
      concatMap(() => {
        return this.restaurantApiService.getUserRestaurants().pipe(
          map((restaurants: Restaurant[]) => setUserRestaurants({ restaurants })),
          catchError(() => [stopUserFetching()]),
        );
      }),
    );
  });

  stopUserFetching$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(setUserRestaurants),
      map(() => stopUserFetching()),
    );
  });

  fetchingCurrentRestaurantPublicKey$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(fetchingCurrentRestaurantPublicKey),
      concatLatestFrom(() =>
        this.store.select(selectRestaurant).pipe(filter(Boolean)),
      ),
      concatMap(([, restaurant]) => {
        return this.restaurantApiService.getRestaurantPublicKey(restaurant.code).pipe(
          map(({ publicKey }) => setRestaurantPublicKey({ publicKey })),
          catchError(() => EMPTY),
        );
      }),
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

  openRegisterConfirmationModal$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(postConfirmEmailUserSuccess),
      map(() => openConfirmationModal({ modal: 'register' })),
    );
  });

  openRecoverConfirmationModal$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(postConfirmRecoverEmailUserSuccess, postValidateRecoverEmailCodeSuccess),
      map(() => openConfirmationModal({ modal: 'recover' })),
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

  fetchingNewUser$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(setNewToken),
      map(() => fetchingUser()),
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

  startLoading$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(fetchingDemoResto),
      map(() => startLoading()),
    );
  });

  fetchingDemoResto$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(fetchingDemoResto),
      concatMap(() => {
        return this.restaurantApiService.getDemoResto().pipe(
          map((restaurant: Restaurant) => {
            return setDemoResto({ restaurant});
          }),
          catchError(() => {
            return [stopLoading(), stopDemoRestoFetching()];
          }),
        );
      }),
    );
  });

  stopDemoRestoFetching$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(setDemoResto),
      map(() => stopDemoRestoFetching()),
    );
  });

  fetchingRestaurant$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(fetchingRestaurant),
      concatMap((action: { code: string }) => {
        return this.restaurantApiService.getRestaurant(action.code).pipe(
          map((restaurant) => setRestaurant({ restaurant })),
          catchError(() => {
            return [stopLoading(), stopRestaurantFetching()];
          }),
        );
      }),
    );
  });

  stopRestaurantFetching$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(setRestaurant),
      map(() => stopRestaurantFetching()),
    );
  });

  constructor(
    private actions$: Actions,
    private loginApiService: LoginApiService,
    private restaurantApiService: RestaurantApiService,
    private store: Store,
  ) {}
}
