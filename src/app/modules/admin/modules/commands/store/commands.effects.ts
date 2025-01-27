import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { EMPTY } from 'rxjs';
import { catchError, filter, map, mergeMap, switchMap, withLatestFrom } from 'rxjs/operators';
import { AdminApiService } from 'src/app/modules/admin/services/admin-api.service';
import { selectRestaurant } from 'src/app/modules/login/store/login.selectors';

import { AppState } from 'src/app/store/app.state';
import {
  cancellingCommand,
  closingCommand,
  editCommand,
  fetchingRestaurantCommands,
  payingCommand,
  removeNotificationSub,
  sendNotificationSub,
  setCommands,
  setNotificationSub,
  stopLoading
} from './commands.actions';

@Injectable()
export class CommandsEffects {
  fetchingRestaurantCommands$ = createEffect(() =>
    this.actions$.pipe(
      ofType(fetchingRestaurantCommands),
      mergeMap((action) => {
        return this.adminApiService.getCommandsByCode(action.code, action.fromDate, action.toDate).pipe(
          switchMap((commands) => {
            return [setCommands({ commands }), stopLoading()];
          }),
        );
      })
    )
  );

  closingCommand$ = createEffect(() =>
    this.actions$.pipe(
      ofType(closingCommand),
      withLatestFrom(
        this.store$.select(selectRestaurant).pipe(filter(Boolean)),
      ),
      mergeMap(([action, restaurant]) => {
        return this.adminApiService
          .closeCommand(restaurant.code, action.command.id!)
          .pipe(
            map((command) => editCommand({ command })),
          );
      })
    )
  );

  cancellingCommand$ = createEffect(() =>
    this.actions$.pipe(
      ofType(cancellingCommand),
      withLatestFrom(
        this.store$.select(selectRestaurant).pipe(filter(Boolean)),
      ),
      mergeMap(([action, restaurant]) => {
        return this.adminApiService
          .deletingCommand(restaurant.code, action.command.id!)
          .pipe(
            map((command) => editCommand({ command })),
          );
      })
    )
  );

  payingCommand$ = createEffect(() =>
    this.actions$.pipe(
      ofType(payingCommand),
      withLatestFrom(
        this.store$.select(selectRestaurant).pipe(filter(Boolean)),
      ),
      mergeMap(([action, restaurant]) => {
        return this.adminApiService
          .payedCommand(restaurant.code, action.command.id!, action.payments, action.discount)
          .pipe(
            map((command) => editCommand({ command })),
          );
      })
    )
  );

  sendNotificationSub$ = createEffect(() =>
    this.actions$.pipe(
      ofType(sendNotificationSub),
      mergeMap((action) => {
        return this.adminApiService.postSub(action.sub, action.code).pipe(
          map(() => setNotificationSub({ sub: action.sub })),
          catchError(() => EMPTY)
        );
      })
    )
  );

  removeNotificationSub$ = createEffect(() =>
    this.actions$.pipe(
      ofType(removeNotificationSub),
      mergeMap((action) => {
        return this.adminApiService.deleteSub(action.code).pipe(
          ofType('Subscription deleted'),
          catchError(() => EMPTY)
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
