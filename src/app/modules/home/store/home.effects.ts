import { Injectable } from '@angular/core';
import { createEffect, ofType, Actions } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { EMPTY } from 'rxjs';
import {
  map,
  mergeMap,
  catchError,
  withLatestFrom,
  switchMap,
} from 'rxjs/operators';
import { AppState } from 'src/app/store/app.state';
import { HomeApiService } from '../services/home-api.service';
import {
  fetchRestaurant,
  fetchRestaurantPastries,
  notificationSubSent,
  resetCommand,
  sendCommand,
  sendNotificationSub,
  setErrorCommand,
  setPastries,
  setPersonalCommand,
  setRestaurant,
} from './home.actions';
import { selectPastries, selectRestaurant, selectSelectedPastries } from './home.selectors';
import { Pastry } from 'src/app/interfaces/pastry.interface';
import { Command, CoreCommand } from 'src/app/interfaces/command.interface';
import { RestaurantApiService } from '../../restaurant/services/restaurant-api.service';
import { Router } from '@angular/router';

@Injectable()
export class HomeEffects {
  fetchRestaurantPastries$ = createEffect(() =>
    this.actions$.pipe(
      ofType(fetchRestaurantPastries),
      mergeMap((action) => {
        return this.homeApiService.getPastries(action.code).pipe(
          map((pastries) => setPastries({ pastries })),
          catchError(() => EMPTY)
        );
      })
    )
  );

  sendCommand$ = createEffect(() =>
    this.actions$.pipe(
      ofType(sendCommand),
      withLatestFrom(this.store$.select(selectPastries)),
      withLatestFrom(this.store$.select(selectSelectedPastries)),
      withLatestFrom(this.store$.select(selectRestaurant)),
      mergeMap(([[[action, allPastries], selectedPastries], restaurant]) => {
        const { name, takeAway, pickUpTime }: CoreCommand = action;

        const command: CoreCommand = {
          name,
          takeAway,
          pickUpTime,
          totalPrice: Object.keys(selectedPastries).reduce((prev, pastryId) => {
            const pastry = allPastries.find(
              (p: Pastry) => p._id === pastryId
            ) as Pastry;

            return prev + pastry.price * selectedPastries[pastryId];
          }, 0),
          pastries: Object.keys(selectedPastries).reduce(
            (prev: Pastry[], pastryId: string) => {
              const pastry = allPastries.find(
                (p: Pastry) => p._id === pastryId
              ) as Pastry;

              [...Array(selectedPastries[pastryId]).keys()].forEach(() => {
                prev.push(pastry);
              });

              return prev;
            },
            []
          ),
        };
        return this.homeApiService.postCommand(restaurant?.code!, command).pipe(
          switchMap((command) => {
            return [setPersonalCommand({ command }), resetCommand()];
          }),
          catchError((error) => [fetchRestaurantPastries({ code: restaurant?.code! }), setErrorCommand({ error })])
        );
      })
    )
  );

  fetchRestaurant$ = createEffect(() =>
    this.actions$.pipe(
      ofType(fetchRestaurant),
      mergeMap((action: { code: string }) => {
        return this.restaurantApiService.getRestaurant(action.code).pipe(
          switchMap((restaurant) => {
            return [setRestaurant({ restaurant }), fetchRestaurantPastries({ code: restaurant.code })];
          }),
        );
      })
    )
  );

  sendNotificationSub$ = createEffect(() =>
    this.actions$.pipe(
      ofType(sendNotificationSub),
      mergeMap((action) => {
        return this.homeApiService.postSub(action.commandId, action.sub).pipe(
          map(() => notificationSubSent()),
          catchError(() => EMPTY)
        );
      })
    )
  );

  constructor(
    private actions$: Actions,
    private store$: Store<AppState>,
    private homeApiService: HomeApiService,
    private restaurantApiService: RestaurantApiService,
  ) { }
}
