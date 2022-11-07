import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { debounceTime, mergeMap, switchMap } from 'rxjs/operators';
import { validateNameRestaurant, setNewRestaurant, setNameError, setNoNameError } from '../../restaurant/store/restaurant.actions';
import { RestaurantApiService } from '../services/restaurant-api.service';
import { createRestaurant } from './restaurant.actions';

@Injectable()
export class RestaurantEffects {
  postRestaurant$ = createEffect(() =>
    this.actions$.pipe(
      ofType(createRestaurant),
      mergeMap((action: { name: string }) => {
        return this.restaurantApiService.postRestaurant(action).pipe(
          switchMap((restaurant) => {
            this.router.navigate(['/', restaurant.code]);
            return [setNewRestaurant({ restaurant })];
          })
        );
      })
    )
  );

  validateNameRestaurant$ = createEffect(() =>
    this.actions$.pipe(
      ofType(validateNameRestaurant),
      debounceTime(500),
      mergeMap((action: { name: string }) => {
        return this.restaurantApiService.validateRestaurantName(action.name).pipe(
          switchMap((isValid: boolean) => {
            if (isValid) {
              return [setNoNameError()];
            } else {
              return [setNameError({ error: true, duplicated: true })];
            }
          })
        );
      })
    )
  );

  constructor(
    private actions$: Actions,
    private router: Router,
    private restaurantApiService: RestaurantApiService
  ) { }
}
