import { Injectable } from '@angular/core';
import { createEffect, ofType, Actions } from '@ngrx/effects';
import { EMPTY } from 'rxjs';
import { catchError, debounceTime, mergeMap, switchMap } from 'rxjs/operators';
import { Restaurant } from 'src/app/interfaces/restaurant.interface';
import { CoreUser } from 'src/app/interfaces/user.interface';
import { LoginApiService } from 'src/app/modules/login/services/login-api.service';
import { RestaurantApiService } from 'src/app/modules/restaurant/services/restaurant-api.service';
import { createUser, fetchUser, setAuthError, setNewToken, setUser, setNoAuthError, setUserEmailError, setUserNoEmailError, signInUser, validateUserEmail, fetchUserRestaurant, setUserRestaurants } from './login.actions';

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
            return [setUserRestaurants({ restaurants })];
          })
        );
      })
    )
  );

  postUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(createUser),
      mergeMap((action: { user: CoreUser }) => {
        return this.loginApiService.postUser(action.user).pipe(
          switchMap((user) => {
            return [setUser({ user })];
          })
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
              return [setAuthError({ error: true })];
            }

            return EMPTY;
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
  ) {}
}
