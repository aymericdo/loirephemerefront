import { Injectable } from '@angular/core';
import { createEffect, ofType, Actions } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { catchError, debounceTime, mergeMap, switchMap, withLatestFrom } from 'rxjs/operators';
import { Restaurant } from 'src/app/interfaces/restaurant.interface';
import { CoreUser } from 'src/app/interfaces/user.interface';
import { LoginApiService } from 'src/app/modules/login/services/login-api.service';
import { selectCode2 } from 'src/app/modules/login/store/login.selectors';
import { RestaurantApiService } from 'src/app/modules/restaurant/services/restaurant-api.service';
import { AppState } from 'src/app/store/app.state';
import {
  createUser, fetchUser, setAuthError,
  setNewToken, setUser, setNoAuthError,
  setUserEmailError, setUserNoEmailError, signInUser,
  validateUserEmail, fetchUserRestaurant, setUserRestaurants,
  stopLoading, confirmEmail, openConfirmationModal,
  setCode2, confirmRecoverEmail, validateRecoverEmailCode,
  openRecoverModal,
  changePassword,
  setPasswordAsChanged,
} from './login.actions';

@Injectable()
export class LoginEffects {
  fetchUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(fetchUser),
      mergeMap(() => {
        return this.loginApiService.getUser().pipe(
          switchMap((user) => {
            return [setUser({ user }), fetchUserRestaurant()];
          })
        );
      })
    )
  );

  fetchUserRestaurant$ = createEffect(() =>
    this.actions$.pipe(
      ofType(fetchUserRestaurant),
      mergeMap(() => {
        return this.restaurantApiService.getUserRestaurants().pipe(
          switchMap((restaurants: Restaurant[]) => {
            return [setUserRestaurants({ restaurants }), stopLoading()];
          })
        );
      })
    )
  );

  confirmEmail$ = createEffect(() =>
    this.actions$.pipe(
      ofType(confirmEmail),
      mergeMap((action: { email: string }) => {
        return this.loginApiService.postConfirmEmailUser(action.email).pipe(
          switchMap((code2: string) => {
            return [setCode2({ code2 }), openConfirmationModal({ modal: true }), stopLoading()];
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
      mergeMap((action: { email: string }) => {
        return this.loginApiService.postConfirmRecoverEmailUser(action.email).pipe(
          switchMap((code2: string) => {
            return [setCode2({ code2 }), openConfirmationModal({ modal: true }), stopLoading()];
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
        const { email, emailCode }: { email: string, emailCode: string } = action;
        return this.loginApiService.postValidateRecoverEmailCode(email, emailCode, code2!).pipe(
          switchMap((isValid: boolean) => {
            if (isValid) {
              return [openConfirmationModal({ modal: false }), openRecoverModal({ modal: true }), stopLoading()];
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
              return [openRecoverModal({ modal: false }), stopLoading(), setPasswordAsChanged({ changed: true })];
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
        const { user, emailCode }: { user: CoreUser, emailCode: string } = action;
        return this.loginApiService.postUser(user, emailCode, code2!).pipe(
          switchMap((userRes) => {
            return [setUser({ user: userRes }), signInUser({ user: { email: userRes.email, password: user.password } })];
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
            return [setNewToken({ token: token.access_token }), setNoAuthError(), fetchUser()];
          }),
          catchError((error) => {
            if (error.status === 401) {
              localStorage.removeItem('access_token');
              return [stopLoading(), setAuthError({ error: true })];
            }

            return [stopLoading()];
          }),
        );
      })
    )
  );

  validateUserEmail$ = createEffect(() =>
    this.actions$.pipe(
      ofType(validateUserEmail),
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

  constructor(
    private actions$: Actions,
    private loginApiService: LoginApiService,
    private restaurantApiService: RestaurantApiService,
    private store$: Store<AppState>,
  ) {}
}
