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
  resetCommand,
  sendCommand,
  setErrorCommand,
  setPastries,
  setPersonalCommand,
} from './home.actions';
import { selectPastries, selectSelectedPastries } from './home.selectors';
import { Pastry } from 'src/app/interfaces/pastry.interface';
import { Command } from 'src/app/interfaces/command.interface';
import { HomeWebSocketService } from '../services/home-socket.service';

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
          table: action.table,
          name: action.name,
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
            this.wsService.sendMessage(
              JSON.stringify({
                event: 'addWaitingQueue',
                data: command,
              })
            );
            return [setPersonalCommand({ command }), resetCommand()];
          }),
          catchError((error) => [setErrorCommand({ error })])
        );
      })
    )
  );

  constructor(
    private actions$: Actions,
    private store$: Store<AppState>,
    private wsService: HomeWebSocketService,
    private homeApiService: HomeApiService
  ) {}
}
