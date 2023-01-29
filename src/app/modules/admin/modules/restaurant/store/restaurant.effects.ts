import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { filter, map, mergeMap, withLatestFrom } from 'rxjs/operators';
import { AdminApiService } from 'src/app/modules/admin/services/admin-api.service';
import { setRestaurant } from 'src/app/modules/login/store/login.actions';
import { selectRestaurant } from 'src/app/modules/login/store/login.selectors';

import { AppState } from 'src/app/store/app.state';
import {
  updateOpeningHour
} from './restaurant.actions';

@Injectable()
export class RestaurantEffects {
  updateOpeningHour$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateOpeningHour),
      withLatestFrom(
        this.store$.select(selectRestaurant).pipe(filter(Boolean)),
      ),
      mergeMap(([action, restaurant]) => {
        return this.adminApiService
          .patchOpeningHour(restaurant.code, action.startHour, action.endHour)
          .pipe(
            map((restaurant) => setRestaurant({ restaurant })),
          );
      })
    )
  );

  constructor(
    private actions$: Actions,
    private store$: Store<AppState>,
    private adminApiService: AdminApiService,
  ) { }
}
