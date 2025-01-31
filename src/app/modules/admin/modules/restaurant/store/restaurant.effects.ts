import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { filter, mergeMap, switchMap } from 'rxjs/operators';
import { AdminApiService } from 'src/app/modules/admin/services/admin-api.service';
import { setRestaurant } from 'src/app/modules/login/store/login.actions';
import { selectRestaurant } from 'src/app/modules/login/store/login.selectors';
import {
  stopLoading,
  updateAlwaysOpen,
  updateDisplayStock,
  updateOpeningPickupTime,
  updateOpeningTime,
  updatePaymentInformation,
} from './restaurant.actions';
import { concatLatestFrom } from '@ngrx/operators';

@Injectable()
export class RestaurantEffects {
  updateOpeningHours$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(updateOpeningTime),
      concatLatestFrom(() =>
        this.store.select(selectRestaurant).pipe(filter(Boolean)),
      ),
      mergeMap(([action, restaurant]) => {
        return this.adminApiService
          .patchOpeningTime(restaurant.code, action.openingTime)
          .pipe(
            switchMap((restaurant) => [setRestaurant({ restaurant }), stopLoading()]),
          );
      }),
    );
  });

  updateOpeningPickupHours$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(updateOpeningPickupTime),
      concatLatestFrom(() =>
        this.store.select(selectRestaurant).pipe(filter(Boolean)),
      ),
      mergeMap(([action, restaurant]) => {
        return this.adminApiService
          .patchOpeningPickupTime(restaurant.code, action.openingTime)
          .pipe(
            switchMap((restaurant) => [setRestaurant({ restaurant }), stopLoading()]),
          );
      }),
    );
  });

  updatePaymentInformation$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(updatePaymentInformation),
      concatLatestFrom(() =>
        this.store.select(selectRestaurant).pipe(filter(Boolean)),
      ),
      mergeMap(([action, restaurant]) => {
        return this.adminApiService
          .postPaymentInformation(
            restaurant.code, action.paymentActivated, action.paymentRequired,
            action.publicKey, action.secretKey,
          )
          .pipe(
            switchMap((restaurant) => [setRestaurant({ restaurant }), stopLoading()]),
          );
      }),
    );
  });

  updateDisplayStock$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(updateDisplayStock),
      concatLatestFrom(() =>
        this.store.select(selectRestaurant).pipe(filter(Boolean)),
      ),
      mergeMap(([action, restaurant]) => {
        return this.adminApiService
          .patchDisplayStock(restaurant.code, action.displayStock)
          .pipe(
            switchMap((restaurant) => [setRestaurant({ restaurant }), stopLoading()]),
          );
      }),
    );
  });

  updateAlwaysOpen$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(updateAlwaysOpen),
      concatLatestFrom(() =>
        this.store.select(selectRestaurant).pipe(filter(Boolean)),
      ),
      mergeMap(([action, restaurant]) => {
        return this.adminApiService
          .patchAlwaysOpen(restaurant.code, action.alwaysOpen)
          .pipe(
            switchMap((restaurant) => [setRestaurant({ restaurant }), stopLoading()]),
          );
      }),
    );
  });

  constructor(
    private actions$: Actions,
    private store: Store,
    private adminApiService: AdminApiService,
  ) { }
}
