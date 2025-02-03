import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { concatMap, map } from 'rxjs/operators';
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
  fetchingAllRestaurantPastries$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(fetchingAllRestaurantPastries),
      concatMap((action) => {
        return this.adminApiService.getAllPastries(action.code).pipe(
          map((pastries) => setAllPastries({ pastries })),
        );
      }),
    );
  });

  fetchingRestaurantCommands$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(fetchingRestaurantCommands),
      concatMap((action) => {
        return this.adminApiService.getCommandsByCode(action.code, action.fromDate, action.toDate, true).pipe(
          map((commands) => setCommands({ commands })),
        );
      }),
    );
  });

  stopLoading$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(setCommands),
      map(() => stopLoading()),
    );
  });

  constructor(
    private actions$: Actions,
    private adminApiService: AdminApiService,
  ) { }
}
