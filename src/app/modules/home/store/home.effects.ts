import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { EMPTY } from 'rxjs';
import {
  catchError,
  concatMap,
  filter,
  map,
} from 'rxjs/operators';
import { concatLatestFrom } from '@ngrx/operators';
import { CoreCommand } from 'src/app/interfaces/command.interface';
import { Pastry } from 'src/app/interfaces/pastry.interface';
import { selectRestaurant } from 'src/app/auth/store/auth.selectors';
import { HomeApiService } from '../services/home-api.service';
import {
  cancelPersonalCommand,
  closeErrorModal,
  closeHomeModal,
  fetchRestaurantPastries, fetchingPersonalCommand, markPersonalCommandAsPayed, markPersonalCommandAsPayedSuccess, notificationSubSent,
  openHomeModal,
  postCommandSuccess,
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
      concatMap((action) => {
        return this.homeApiService.getPastries(action.code).pipe(
          map((pastries) => setPastries({ pastries })),
          catchError(() => EMPTY),
        );
      }),
    );
  });

  sendingCommand$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(sendingCommand),
      concatLatestFrom(() => [
        this.store.select(selectPastries),
        this.store.select(selectSelectedPastries),
        this.store.select(selectRestaurant).pipe(filter(Boolean)),
      ]),
      concatMap(([action, allPastries, selectedPastries, restaurant]) => {
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
          map((command) => postCommandSuccess({ command })),
          catchError((error) => [setErrorCommand({ error })]),
        );
      }),
    );
  });

  setErrorCommand$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(setErrorCommand),
      concatLatestFrom(() => this.store.select(selectRestaurant).pipe(filter(Boolean))),
      map(([_, restaurant]) => fetchRestaurantPastries({ code: restaurant.code })),
    );
  });

  setPersonalCommand$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(postCommandSuccess),
      map(({ command }) => setPersonalCommand({ command })),
    );
  });

  resetCommand$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(postCommandSuccess, resetPersonalCommand),
      map(() => resetCommand()),
    );
  });

  openHomeModal$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(postCommandSuccess),
      map(({ command }) => openHomeModal({
        modal: command.paymentRequired ? 'payment' : 'success',
      })),
    );
  });

  fetchingPersonalCommand$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(fetchingPersonalCommand),
      concatLatestFrom(() => this.store.select(selectRestaurant).pipe(filter(Boolean))),
      concatMap(([action, restaurant]) => {
        return this.homeApiService.getPersonalCommand(restaurant?.code!, action.commandId).pipe(
          map((command) => setPersonalCommand({ command })),
          catchError(() => EMPTY),
        );
      }),
    );
  });

  cancelPersonalCommand$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(cancelPersonalCommand),
      concatLatestFrom(() => this.store.select(selectRestaurant).pipe(filter(Boolean))),
      concatMap(([action, restaurant]) => {
        return this.homeApiService.cancelPersonalCommand(restaurant?.code!, action.commandId).pipe(
          map(() => resetPersonalCommand()),
          catchError(() => EMPTY),
        );
      }),
    );
  });

  markPersonalCommandAsPayed$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(markPersonalCommandAsPayed),
      concatLatestFrom(() => this.store.select(selectRestaurant).pipe(filter(Boolean))),
      concatMap(([action, restaurant]) => {
        return this.homeApiService.markPersonalCommandAsPayed(
          restaurant?.code!, action.commandId, action.sessionId,
        ).pipe(
          map((command) => {
            this.router.navigate([restaurant?.code!], { queryParams: { payedCommandId: command.id }});
            return markPersonalCommandAsPayedSuccess({ command });
          }),
          catchError((error) => [setErrorCommand({ error })]),
        );
      }),
    );
  });

  sendNotificationSub$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(sendNotificationSub),
      concatMap((action) => {
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
      map(() => closeHomeModal()),
    );
  });

  resetErrorCommand$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(closeErrorModal),
      map(() => resetErrorCommand()),
    );
  });

  stopLoading$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(setPastries),
      map(() => stopLoading()),
    );
  });

  constructor(
    private actions$: Actions,
    private store: Store,
    private router: Router,
    private homeApiService: HomeApiService,
  ) { }
}
