import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { EMPTY } from 'rxjs';
import { catchError, mergeMap, switchMap } from 'rxjs/operators';
import { setRestaurant } from '../../home/store/home.actions';
import { RestaurantApiService } from '../../restaurant/services/restaurant-api.service';
import {
  fetchingRestaurant,
  stopLoading,
} from './admin.actions';

@Injectable()
export class AdminEffects {
  fetchingRestaurant$ = createEffect(() =>
    this.actions$.pipe(
      ofType(fetchingRestaurant),
      mergeMap((action: { code: string }) => {
        return this.restaurantApiService.getRestaurant(action.code).pipe(
          switchMap((restaurant) => {
            return [
              stopLoading(),
              setRestaurant({ restaurant }),
            ];
          }),
          catchError(() => EMPTY)
        );
      })
    )
  );

  constructor(
    private actions$: Actions,
    private restaurantApiService: RestaurantApiService,
  ) { }
}
