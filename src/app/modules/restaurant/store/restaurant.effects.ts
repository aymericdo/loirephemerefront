import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { concatMap, debounceTime, map, switchMap } from 'rxjs/operators';
import { addUserRestaurants, postRestaurantSuccess, refreshingUser } from 'src/app/modules/login/store/login.actions';
import { setNewRestaurant, setRestaurantNameError, setRestaurantNoNameError, validateRestaurantName } from '../../restaurant/store/restaurant.actions';
import { RestaurantApiService } from '../services/restaurant-api.service';
import { createRestaurant } from './restaurant.actions';

@Injectable()
export class RestaurantEffects {
  postRestaurant$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(createRestaurant),
      concatMap((action: { name: string }) => {
        return this.restaurantApiService.postRestaurant(action).pipe(
          map((restaurant) => postRestaurantSuccess({ restaurant })),
        );
      }),
    );
  });

  refreshingUser$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(postRestaurantSuccess),
      map(() => refreshingUser()),
    );
  });

  addUserRestaurants$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(postRestaurantSuccess),
      map(({ restaurant }) => addUserRestaurants({ restaurant })),
    );
  });

  setNewRestaurant$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(postRestaurantSuccess),
      map(({ restaurant }) => setNewRestaurant({ restaurant })),
    );
  });

  validateRestaurantName$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(validateRestaurantName),
      debounceTime(500),
      switchMap((action: { name: string }) => {
        return this.restaurantApiService.validateRestaurantName(action.name).pipe(
          map((isValid: boolean) => {
            if (isValid) {
              return setRestaurantNoNameError();
            } else {
              return setRestaurantNameError({ error: true, duplicated: true });
            }
          }),
        );
      }),
    );
  });

  constructor(
    private actions$: Actions,
    private restaurantApiService: RestaurantApiService,
  ) { }
}
