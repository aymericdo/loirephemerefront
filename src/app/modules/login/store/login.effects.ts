import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { catchError, concatMap, debounceTime, filter, map, mergeMap, switchMap } from 'rxjs/operators';
import { Restaurant } from 'src/app/interfaces/restaurant.interface';
import { CoreUser } from 'src/app/interfaces/user.interface';
import { LoginApiService } from 'src/app/modules/login/services/login-api.service';
import { selectCode2, selectRestaurant } from 'src/app/modules/login/store/login.selectors';
import { RestaurantApiService } from 'src/app/modules/restaurant/services/restaurant-api.service';
import {
  changePassword, confirmEmail, confirmRecoverEmail,
  createUser, fetchingCurrentRestaurantPublicKey, fetchingDemoResto,
  fetchingRestaurant, fetchingUser, getUserSuccess,
  openConfirmationModal, openRecoverModal, refreshingUser, setAuthError,
  setCode2, setDemoResto, setNewToken, setNoAuthError,
  setPasswordAsChanged, setRestaurant, setRestaurantPublicKey, setUser, setUserEmailError,
  setUserNoEmailError, setUserRestaurants, signInUser,
  startFirstNavigation, stopDemoRestoFetching, stopLoading, stopRestaurantFetching, stopUserFetching,
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
          map((user) => {
            return getUserSuccess({ user });
          }),
          catchError(() => {
            return [stopUserFetching()];
          }),
        );
      }),
    );
  });

  setUser$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(getUserSuccess),
      map(({ user }) => setUser({ user })),
    );
  });

  stopLoading$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(getUserSuccess),
      map(() => stopLoading()),
    );
  });

  refreshingUser$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(refreshingUser),
      concatMap(() => {
        return this.loginApiService.getUser().pipe(
          map((user) => {
            return setUser({ user });
          }),
        );
      }),
    );
  });

  fetchingUserRestaurants$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(getUserSuccess),
      concatMap(() => {
        return this.restaurantApiService.getUserRestaurants().pipe(
          switchMap((restaurants: Restaurant[]) => {
            return [setUserRestaurants({ restaurants }), stopUserFetching()];
          }),
          catchError(() => {
            return [stopUserFetching(), stopLoading()];
          }),
        );
      }),
    );
  });

  fetchingCurrentRestaurantPublicKey$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(fetchingCurrentRestaurantPublicKey),
      concatLatestFrom(() =>
        this.store.select(selectRestaurant).pipe(filter(Boolean)),
      ),
      mergeMap(([, restaurant]) => {
        return this.restaurantApiService.getRestaurantPublicKey(restaurant.code).pipe(
          switchMap(({ publicKey }) => {
            return [setRestaurantPublicKey({ publicKey })];
          }),
          catchError(() => {
            return EMPTY;
          }),
        );
      }),
    );
  });

  confirmEmail$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(confirmEmail),
      mergeMap((action: { email: string, captchaToken: string }) => {
        return this.loginApiService.postConfirmEmailUser(action.email, action.captchaToken).pipe(
          switchMap((code2: string) => {
            return [setCode2({ code2 }), openConfirmationModal({ modal: 'register' }), stopLoading()];
          }),
          catchError(() => {
            return [stopLoading()];
          }),
        );
      }),
    );
  });

  confirmRecoverEmail$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(confirmRecoverEmail),
      mergeMap((action: { email: string, captchaToken: string }) => {
        return this.loginApiService.postConfirmRecoverEmailUser(action.email, action.captchaToken).pipe(
          switchMap((code2: string) => {
            return [setCode2({ code2 }), openConfirmationModal({ modal: 'recover' }), stopLoading()];
          }),
          catchError(() => {
            return [stopLoading()];
          }),
        );
      }),
    );
  });

  validateRecoverEmailCode$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(validateRecoverEmailCode),
      concatLatestFrom(() => this.store.select(selectCode2)),
      mergeMap(([action, code2]) => {
        const { email, emailCode }: { email: string, emailCode: string } =
          action as { email: string, emailCode: string };
        return this.loginApiService.postValidateRecoverEmailCode(email, emailCode, code2!).pipe(
          switchMap((isValid: boolean) => {
            if (isValid) {
              return [openConfirmationModal({ modal: 'recover' }), openRecoverModal({ modal: true }), stopLoading()];
            } else {
              return [stopLoading()];
            }
          }),
          catchError(() => {
            return [stopLoading()];
          }),
        );
      }),
    );
  });

  changePassword$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(changePassword),
      concatLatestFrom(() => this.store.select(selectCode2)),
      mergeMap(([action, code2]) => {
        const { email, password, emailCode }: { email: string, password: string, emailCode: string } = action;
        return this.loginApiService.postChangePassword(email, password, emailCode, code2!).pipe(
          switchMap((isValid: boolean) => {
            if (isValid) {
              return [openRecoverModal({ modal: false }), setPasswordAsChanged({ changed: true }), stopLoading()];
            } else {
              return [stopLoading()];
            }
          }),
          catchError(() => {
            return [stopLoading()];
          }),
        );
      }),
    );
  });

  postUser$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(createUser),
      concatLatestFrom(() => this.store.select(selectCode2)),
      mergeMap(([action, code2]) => {
        const { user, emailCode }: { user: CoreUser, emailCode: string } =
          action as { user: CoreUser, emailCode: string };
        return this.loginApiService.postUser(user, emailCode, code2!).pipe(
          switchMap((userRes) => {
            return [
              setUser({ user: userRes }),
              openConfirmationModal({ modal: '' }),
              signInUser({ user: { email: userRes.email, password: user.password } }),
            ];
          }),
          catchError(() => {
            return [stopLoading()];
          }),
        );
      }),
    );
  });

  signInUser$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(signInUser),
      mergeMap((action: { user: CoreUser }) => {
        return this.loginApiService.postAuthLogin(action.user).pipe(
          switchMap((token: { access_token: string }) => {
            localStorage.setItem('access_token', token.access_token);
            return [setNewToken({ token: token.access_token }), setNoAuthError(), fetchingUser()];
          }),
          catchError((error) => {
            if (error.status === 401) {
              localStorage.removeItem('access_token');
              return [stopLoading(), setAuthError({ error: true })]; // order is important
            }

            return [stopLoading()];
          }),
        );
      }),
    );
  });

  validatingUserEmail$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(validatingUserEmail),
      debounceTime(500),
      mergeMap((action: { email: string }) => {
        return this.loginApiService.validateUserEmail(action.email).pipe(
          switchMap((isValid: boolean) => {
            if (isValid) {
              return [setUserNoEmailError()];
            } else {
              return [setUserEmailError({ error: true, duplicated: true })];
            }
          }),
        );
      }),
    );
  });

  startLoading$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(fetchingDemoResto),
      mergeMap(() => [startLoading()]),
    );
  });

  fetchingDemoResto$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(fetchingDemoResto),
      mergeMap(() => {
        return this.restaurantApiService.getDemoResto().pipe(
          switchMap((restaurant: Restaurant) => {
            return [
              setDemoResto({ restaurant}),
              stopDemoRestoFetching(),
            ];
          }),
          catchError(() => {
            return [stopLoading(), stopDemoRestoFetching()];
          }),
        );
      }),
    );
  });

  fetchingRestaurant$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(fetchingRestaurant),
      mergeMap((action: { code: string }) => {
        return this.restaurantApiService.getRestaurant(action.code).pipe(
          switchMap((restaurant) => {
            return [
              stopLoading(),
              stopRestaurantFetching(),
              setRestaurant({ restaurant }),
            ];
          }),
          catchError(() => {
            return [stopLoading(), stopRestaurantFetching()];
          }),
        );
      }),
    );
  });

  constructor(
    private actions$: Actions,
    private loginApiService: LoginApiService,
    private restaurantApiService: RestaurantApiService,
    private store: Store,
  ) {}
}
