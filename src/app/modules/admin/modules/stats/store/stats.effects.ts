import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { mergeMap, switchMap } from 'rxjs/operators';
import { AdminApiService } from 'src/app/modules/admin/services/admin-api.service';
import { setRestaurant } from 'src/app/modules/home/store/home.actions';
import { RestaurantApiService } from 'src/app/modules/restaurant/services/restaurant-api.service';
import {
  fetchingAllRestaurantPastries,
  fetchingRestaurant,
  fetchingRestaurantCommands,
  setCommands,
  stopStatsLoading,
} from './stats.actions';

@Injectable()
export class StatsEffects {
  fetchingRestaurantCommands$ = createEffect(() =>
    this.actions$.pipe(
      ofType(fetchingRestaurantCommands),
      mergeMap((action) => {
        return this.adminApiService.getCommandsByCode(action.code, action.fromDate, action.toDate).pipe(
          switchMap((commands) => {
            return [setCommands({ commands }), stopStatsLoading()];
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
              setRestaurant({ restaurant }),
              fetchingAllRestaurantPastries({ code: restaurant.code }),
            ];
          }),
        );
      })
    )
  );

  constructor(
    private actions$: Actions,
    private adminApiService: AdminApiService,
    private restaurantApiService: RestaurantApiService,
  ) { }
}
