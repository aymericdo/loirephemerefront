import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { catchError, concatMap, filter, map } from 'rxjs/operators';
import { Restaurant } from 'src/app/interfaces/restaurant.interface';
import { LoginApiService } from 'src/app/modules/login/services/login-api.service';
import { selectRestaurant } from 'src/app/auth/store/auth.selectors';
import { RestaurantApiService } from 'src/app/modules/restaurant/services/restaurant-api.service';
import {
  fetchingCurrentRestaurantPublicKey, fetchingDemoResto,
  fetchingRestaurant, fetchingUser, getUserSuccess,
  refreshingUser,
  setDemoResto, setNewToken,
  setRestaurant, setRestaurantPublicKey, setUser,
  setUserRestaurants,
  startFirstNavigation, stopDemoRestoFetching, stopLoading,
  stopRestaurantFetching, stopUserFetching,
} from './auth.actions';
import { startLoading } from 'src/app/modules/home/store/home.actions';
import { EMPTY } from 'rxjs';
import { concatLatestFrom } from '@ngrx/operators';
import { postUserSuccess } from 'src/app/modules/login/store/login.actions';

@Injectable()
export class AuthEffects {
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

  fetchingNewUser$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(setNewToken),
      map(() => fetchingUser()),
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
