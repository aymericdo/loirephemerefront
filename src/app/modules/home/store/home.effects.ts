import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { EMPTY } from 'rxjs';
import {
  catchError,
  filter,
  map,
  mergeMap,
  switchMap,
  withLatestFrom
} from 'rxjs/operators';
import { CoreCommand } from 'src/app/interfaces/command.interface';
import { Pastry } from 'src/app/interfaces/pastry.interface';
import { selectRestaurant } from 'src/app/modules/login/store/login.selectors';
import { AppState } from 'src/app/store/app.state';
import { HomeApiService } from '../services/home-api.service';
import {
  fetchRestaurantPastries, getPersonalCommand, notificationSubSent,
  resetCommand,
  sendCommand,
  sendNotificationSub,
  setErrorCommand,
  setPastries,
  setPersonalCommand,
  stopLoading
} from './home.actions';
import { selectPastries, selectSelectedPastries } from './home.selectors';

@Injectable()
export class HomeEffects {
  fetchRestaurantPastries$ = createEffect(() =>
    this.actions$.pipe(
      ofType(fetchRestaurantPastries),
      mergeMap((action) => {
        return this.homeApiService.getPastries(action.code).pipe(
          switchMap((pastries) => [setPastries({ pastries }), stopLoading()]),
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
      withLatestFrom(this.store$.select(selectRestaurant).pipe(filter(Boolean))),
      mergeMap(([[[action, allPastries], selectedPastries], restaurant]) => {
        const { name, takeAway, pickUpTime }: CoreCommand = action;

        const command: CoreCommand = {
          name,
          takeAway,
          pickUpTime,
          pastries: Object.keys(selectedPastries).reduce(
            (prev: Pastry[], pastryId: string) => {
              const pastry = allPastries.find(
                (p: Pastry) => p.id === pastryId
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
          catchError((error) => [fetchRestaurantPastries({ code: restaurant.code }), setErrorCommand({ error })])
        );
      })
    )
  );

  getPersonalCommand$ = createEffect(() =>
    this.actions$.pipe(
      ofType(getPersonalCommand),
      withLatestFrom(this.store$.select(selectRestaurant).pipe(filter(Boolean))),
      mergeMap(([action, restaurant]) => {
        return this.homeApiService.getPersonalCommand(restaurant?.code!, action.commandId).pipe(
          switchMap((command) => {
            return [setPersonalCommand({ command }), resetCommand()];
          }),
          catchError(() => EMPTY)
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
  ) { }
}
