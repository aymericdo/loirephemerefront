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
} from 'rxjs/operators';
import { concatLatestFrom } from '@ngrx/operators';
import { CoreCommand } from 'src/app/interfaces/command.interface';
import { Pastry } from 'src/app/interfaces/pastry.interface';
import { selectRestaurant } from 'src/app/modules/login/store/login.selectors';
import { HomeApiService } from '../services/home-api.service';
import {
  cancelPersonalCommand,
  closeErrorModal,
  closeHomeModal,
  fetchRestaurantPastries, fetchingPersonalCommand, markPersonalCommandAsPayed, notificationSubSent,
  openHomeModal,
  resetCommand,
  resetErrorCommand,
  resetPersonalCommand,
  sendNotificationSub,
  sendingCommand,
  setErrorCommand,
  setPastries,
  setPersonalCommand,
  stopLoading,
} from './home.actions';
import { selectPastries, selectSelectedPastries } from './home.selectors';
import { Router } from '@angular/router';

@Injectable()
export class HomeEffects {
  fetchRestaurantPastries$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(fetchRestaurantPastries),
      mergeMap((action) => {
        return this.homeApiService.getPastries(action.code).pipe(
          switchMap((pastries) => [setPastries({ pastries }), stopLoading()]),
          catchError(() => EMPTY),
        );
      }),
    );
  });

  sendingCommand$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(sendingCommand),
      concatLatestFrom(() => this.store.select(selectPastries)),
      concatLatestFrom(() => this.store.select(selectSelectedPastries)),
      concatLatestFrom(() => this.store.select(selectRestaurant).pipe(filter(Boolean))),
      mergeMap(([[[action, allPastries], selectedPastries], restaurant]) => {
        const { name, takeAway, pickUpTime }: CoreCommand = action.command;

        const command: CoreCommand = {
          name,
          takeAway,
          pickUpTime,
          pastries: Object.keys(selectedPastries).reduce(
            (prev: Pastry[], pastryId: string) => {
              const pastry = allPastries.find(
                (p: Pastry) => p.id === pastryId,
              ) as Pastry;

              [...Array(selectedPastries[pastryId]).keys()].forEach(() => {
                prev.push(pastry);
              });

              return prev;
            },
            [],
          ),
        };
        return this.homeApiService.postCommand(restaurant?.code!, command).pipe(
          switchMap((command) => {
            return [
              setPersonalCommand({ command }),
              resetCommand(),
              openHomeModal({
                modal: command.paymentRequired ? 'payment' : 'success',
              }),
            ];
          }),
          catchError((error) => [fetchRestaurantPastries({ code: restaurant.code }), setErrorCommand({ error })]),
        );
      }),
    );
  });

  fetchingPersonalCommand$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(fetchingPersonalCommand),
      concatLatestFrom(() => this.store.select(selectRestaurant).pipe(filter(Boolean))),
      mergeMap(([action, restaurant]) => {
        return this.homeApiService.getPersonalCommand(restaurant?.code!, action.commandId).pipe(
          switchMap((command) => {
            return [setPersonalCommand({ command }), resetCommand()];
          }),
          catchError(() => EMPTY),
        );
      }),
    );
  });

  cancelPersonalCommand$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(cancelPersonalCommand),
      concatLatestFrom(() => this.store.select(selectRestaurant).pipe(filter(Boolean))),
      mergeMap(([action, restaurant]) => {
        return this.homeApiService.cancelPersonalCommand(restaurant?.code!, action.commandId).pipe(
          switchMap(() => {
            return [resetPersonalCommand(), resetCommand()];
          }),
          catchError(() => EMPTY),
        );
      }),
    );
  });

  markPersonalCommandAsPayed$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(markPersonalCommandAsPayed),
      concatLatestFrom(() => this.store.select(selectRestaurant).pipe(filter(Boolean))),
      mergeMap(([action, restaurant]) => {
        return this.homeApiService.markPersonalCommandAsPayed(
          restaurant?.code!, action.commandId, action.sessionId,
        ).pipe(
          switchMap((command) => {
            this.router.navigate([restaurant?.code!], { queryParams: { payedCommandId: command.id }});
            return [setPersonalCommand({ command }), resetCommand()];
          }),
          catchError((error) => {
            return [setErrorCommand({ error })];
          }),
        );
      }),
    );
  });

  sendNotificationSub$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(sendNotificationSub),
      mergeMap((action) => {
        return this.homeApiService.postSub(action.commandId, action.sub).pipe(
          map(() => notificationSubSent()),
          catchError(() => EMPTY),
        );
      }),
    );
  });

  closeHomeModal$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(closeErrorModal),
      mergeMap(() => [closeHomeModal()]),
    );
  });

  resetErrorCommand$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(closeErrorModal),
      mergeMap(() => [resetErrorCommand()]),
    );
  });

  constructor(
    private actions$: Actions,
    private store: Store,
    private router: Router,
    private homeApiService: HomeApiService,
  ) { }
}
