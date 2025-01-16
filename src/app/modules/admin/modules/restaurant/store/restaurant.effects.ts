import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { filter, mergeMap, switchMap, withLatestFrom } from 'rxjs/operators';
import { AdminApiService } from 'src/app/modules/admin/services/admin-api.service';
import { setRestaurant } from 'src/app/modules/login/store/login.actions';
import { selectRestaurant } from 'src/app/modules/login/store/login.selectors';

import { AppState } from 'src/app/store/app.state';
import {
  stopLoading,
  updateAlwaysOpen,
  updateDisplayStock,
  updateOpeningPickupTime,
  updateOpeningTime,
  updatePaymentInformation
} from './restaurant.actions';

@Injectable()
export class RestaurantEffects {
  updateOpeningHours$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateOpeningTime),
      withLatestFrom(
        this.store$.select(selectRestaurant).pipe(filter(Boolean)),
      ),
      mergeMap(([action, restaurant]) => {
        return this.adminApiService
          .patchOpeningTime(restaurant.code, action.openingTime)
          .pipe(
            switchMap((restaurant) => [setRestaurant({ restaurant }), stopLoading()]),
          );
      })
    )
  );
  updateOpeningPickupHours$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateOpeningPickupTime),
      withLatestFrom(
        this.store$.select(selectRestaurant).pipe(filter(Boolean)),
      ),
      mergeMap(([action, restaurant]) => {
        return this.adminApiService
          .patchOpeningPickupTime(restaurant.code, action.openingTime)
          .pipe(
            switchMap((restaurant) => [setRestaurant({ restaurant }), stopLoading()]),
          );
      })
    )
  );
  updatePaymentInformation$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updatePaymentInformation),
      withLatestFrom(
        this.store$.select(selectRestaurant).pipe(filter(Boolean)),
      ),
      mergeMap(([action, restaurant]) => {
        return this.adminApiService
          .postPaymentInformation(
            restaurant.code, action.paymentActivated, action.paymentRequired,
            action.publicKey, action.secretKey
          )
          .pipe(
            switchMap((restaurant) => [setRestaurant({ restaurant }), stopLoading()]),
          );
      })
    )
  );
  updateDisplayStock$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateDisplayStock),
      withLatestFrom(
        this.store$.select(selectRestaurant).pipe(filter(Boolean)),
      ),
      mergeMap(([action, restaurant]) => {
        return this.adminApiService
          .patchDisplayStock(restaurant.code, action.displayStock)
          .pipe(
            switchMap((restaurant) => [setRestaurant({ restaurant }), stopLoading()]),
          );
      })
    )
  );
  updateAlwaysOpen$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateAlwaysOpen),
      withLatestFrom(
        this.store$.select(selectRestaurant).pipe(filter(Boolean)),
      ),
      mergeMap(([action, restaurant]) => {
        return this.adminApiService
          .patchAlwaysOpen(restaurant.code, action.alwaysOpen)
          .pipe(
            switchMap((restaurant) => [setRestaurant({ restaurant }), stopLoading()]),
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
