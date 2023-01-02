import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { mergeMap, switchMap } from 'rxjs/operators';
import { AdminApiService } from 'src/app/modules/admin/services/admin-api.service';
import {
  fetchingAllRestaurantPastries,
  fetchingRestaurantCommands,
  setAllPastries,
  setCommands,
  stopLoading,
} from './stats.actions';

@Injectable()
export class StatsEffects {
  fetchingAllRestaurantPastries$ = createEffect(() =>
    this.actions$.pipe(
      ofType(fetchingAllRestaurantPastries),
      mergeMap((action) => {
        return this.adminApiService.getAllPastries(action.code).pipe(
          switchMap((pastries) => {
            return [setAllPastries({ pastries })];
          }),
        );
      })
    )
  );

  fetchingRestaurantCommands$ = createEffect(() =>
    this.actions$.pipe(
      ofType(fetchingRestaurantCommands),
      mergeMap((action) => {
        return this.adminApiService.getCommandsByCode(action.code, action.fromDate, action.toDate).pipe(
          switchMap((commands) => {
            return [stopLoading(), setCommands({ commands })];
          }),
        );
      })
    )
  );

  constructor(
    private actions$: Actions,
    private adminApiService: AdminApiService,
  ) { }
}
