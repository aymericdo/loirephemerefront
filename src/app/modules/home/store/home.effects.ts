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
  fetchPastries,
  notificationSubSent,
  resetCommand,
  sendCommand,
  sendNotificationSub,
  setErrorCommand,
  setPastries,
  setPersonalCommand,
} from './home.actions';
import { selectPastries, selectSelectedPastries } from './home.selectors';
import { Pastry } from 'src/app/interfaces/pastry.interface';
import { Command } from 'src/app/interfaces/command.interface';

@Injectable()
export class HomeEffects {
  fetchPastries$ = createEffect(() =>
    this.actions$.pipe(
      ofType(fetchPastries),
      mergeMap(() => {
        return this.homeApiService.getAll().pipe(
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
      mergeMap(([[action, allPastries], selectedPastries]) => {
        const command: Command = {
          name: action.name,
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
        return this.homeApiService.postCommand(command).pipe(
          switchMap((command) => {
            return [setPersonalCommand({ command }), resetCommand()];
          }),
          catchError((error) => [fetchPastries(), setErrorCommand({ error })])
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
    private homeApiService: HomeApiService
  ) { }
}
