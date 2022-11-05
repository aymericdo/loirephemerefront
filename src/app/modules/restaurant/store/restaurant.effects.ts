import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { mergeMap, switchMap } from 'rxjs/operators';
import { setNewRestaurant } from '../../restaurant/store/restaurant.actions';
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
            return [setNewRestaurant({ restaurant })];
          })
        );
      })
    )
  );

  constructor(
    private actions$: Actions,
    private restaurantApiService: RestaurantApiService
  ) { }
}
