import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { catchError, debounceTime, mergeMap, switchMap, withLatestFrom } from 'rxjs/operators';
import { Restaurant } from 'src/app/interfaces/restaurant.interface';
import { CoreUser } from 'src/app/interfaces/user.interface';
import { LoginApiService } from 'src/app/modules/login/services/login-api.service';
import { selectCode2 } from 'src/app/modules/login/store/login.selectors';
import { RestaurantApiService } from 'src/app/modules/restaurant/services/restaurant-api.service';
import { AppState } from 'src/app/store/app.state';
import {
  changePassword, confirmEmail, confirmRecoverEmail,
  createUser, fetchingDemoResto, fetchingRestaurant, fetchingUser, fetchingUserRestaurants,
  openConfirmationModal, openRecoverModal, refreshingUser, setAuthError,
  setCode2, setDemoResto, setNewToken, setNoAuthError,
  setPasswordAsChanged, setRestaurant, setUser, setUserEmailError,
  setUserNoEmailError, setUserRestaurants, signInUser,
  stopDemoRestoFetching,
  stopLoading,
  stopRestaurantFetching,
  stopUserFetching,
  validateRecoverEmailCode,
  validatingUserEmail
} from './login.actions';
import { startLoading } from 'src/app/modules/home/store/home.actions';

@Injectable()
export class LoginEffects {
  fetchingUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(fetchingUser),
      mergeMap(() => {
        return this.loginApiService.getUser().pipe(
          switchMap((user) => {
            return [setUser({ user }), fetchingUserRestaurants()];
          }),
          catchError(() => {
            return [stopUserFetching()];
          }),
        );
      })
    )
  );

  refreshingUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(refreshingUser),
      mergeMap(() => {
        return this.loginApiService.getUser().pipe(
          switchMap((user) => {
            return [setUser({ user })];
          })
        );
      })
    )
  );

  fetchingUserRestaurants$ = createEffect(() =>
    this.actions$.pipe(
      ofType(fetchingUserRestaurants),
      mergeMap(() => {
        return this.restaurantApiService.getUserRestaurants().pipe(
          switchMap((restaurants: Restaurant[]) => {
            return [setUserRestaurants({ restaurants }), stopUserFetching()];
          }),
          catchError(() => {
            return [stopUserFetching(), stopLoading()];
          }),
        );
      })
    )
  );

  confirmEmail$ = createEffect(() =>
    this.actions$.pipe(
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
      })
    )
  );

  confirmRecoverEmail$ = createEffect(() =>
    this.actions$.pipe(
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
      })
    )
  );

  validateRecoverEmailCode$ = createEffect(() =>
    this.actions$.pipe(
      ofType(validateRecoverEmailCode),
      withLatestFrom(this.store$.select(selectCode2)),
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
      })
    )
  );

  changePassword$ = createEffect(() =>
    this.actions$.pipe(
      ofType(changePassword),
      withLatestFrom(this.store$.select(selectCode2)),
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
      })
    )
  );

  postUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(createUser),
      withLatestFrom(this.store$.select(selectCode2)),
      mergeMap(([action, code2]) => {
        const { user, emailCode }: { user: CoreUser, emailCode: string } =
          action as { user: CoreUser, emailCode: string };
        return this.loginApiService.postUser(user, emailCode, code2!).pipe(
          switchMap((userRes) => {
            return [
              setUser({ user: userRes }),
              signInUser({ user: { email: userRes.email, password: user.password } }),
              openConfirmationModal({ modal: 'register' })
            ];
          }),
          catchError(() => {
            return [stopLoading()];
          }),
        );
      })
    )
  );

  signInUser$ = createEffect(() =>
    this.actions$.pipe(
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
      })
    )
  );

  validatingUserEmail$ = createEffect(() =>
    this.actions$.pipe(
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
          })
        );
      })
    )
  );

  fetchingDemoResto$ = createEffect(() =>
    this.actions$.pipe(
      ofType(fetchingDemoResto),
      mergeMap(() => {
        this.store$.dispatch(startLoading());
        return this.restaurantApiService.getDemoResto().pipe(
          switchMap((restaurant: Restaurant) => {
            return [
              setDemoResto({ restaurant}),
              stopDemoRestoFetching()
            ];
          }),
          catchError(() => {
            return [stopLoading(), stopDemoRestoFetching()];
          }),
        );
      })
    )
  );

  fetchingRestaurant$ = createEffect(() =>
    this.actions$.pipe(
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
      })
    )
  );

  constructor(
    private actions$: Actions,
    private loginApiService: LoginApiService,
    private restaurantApiService: RestaurantApiService,
    private store$: Store<AppState>,
  ) {}
}
