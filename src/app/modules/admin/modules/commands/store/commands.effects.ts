import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { EMPTY } from 'rxjs';
import { catchError, concatMap, filter, map, mergeMap } from 'rxjs/operators';
import { concatLatestFrom } from '@ngrx/operators';
import { AdminApiService } from 'src/app/modules/admin/services/admin-api.service';
import { selectRestaurant } from 'src/app/modules/login/store/login.selectors';
import {
  cancellingCommand,
  closingCommand,
  deleteSub,
  editCommand,
  fetchingRestaurantCommands,
  getCommandsSuccess,
  payingCommand,
  removeNotificationSub,
  sendNotificationSub,
  setCommands,
  setNotificationSub,
  stopLoading,
} from './commands.actions';

@Injectable()
export class CommandsEffects {
  fetchingRestaurantCommands$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(fetchingRestaurantCommands),
      concatMap((action) => {
        return this.adminApiService.getCommandsByCode(action.code, action.fromDate, action.toDate).pipe(
          map((commands) => {
            return getCommandsSuccess({ commands });
          }),
        );
      }),
    );
  });

  setCommands$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(getCommandsSuccess),
      map(({ commands }) => setCommands({ commands })),
    );
  });

  stopLoading$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(getCommandsSuccess),
      map(() => stopLoading()),
    );
  });

  closingCommand$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(closingCommand),
      concatLatestFrom(() =>
        this.store.select(selectRestaurant).pipe(filter(Boolean)),
      ),
      mergeMap(([action, restaurant]) => {
        return this.adminApiService
          .closeCommand(restaurant.code, action.command.id!)
          .pipe(
            map((command) => editCommand({ command })),
          );
      }),
    );
  });

  cancellingCommand$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(cancellingCommand),
      concatLatestFrom(() =>
        this.store.select(selectRestaurant).pipe(filter(Boolean)),
      ),
      mergeMap(([action, restaurant]) => {
        return this.adminApiService
          .deletingCommand(restaurant.code, action.command.id!)
          .pipe(
            map((command) => editCommand({ command })),
          );
      }),
    );
  });

  payingCommand$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(payingCommand),
      concatLatestFrom(() =>
        this.store.select(selectRestaurant).pipe(filter(Boolean)),
      ),
      mergeMap(([action, restaurant]) => {
        return this.adminApiService
          .payedCommand(restaurant.code, action.command.id!, action.payments, action.discount)
          .pipe(
            map((command) => editCommand({ command })),
          );
      }),
    );
  });

  sendNotificationSub$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(sendNotificationSub),
      mergeMap((action) => {
        return this.adminApiService.postSub(action.sub, action.code).pipe(
          map(() => setNotificationSub({ sub: action.sub })),
          catchError(() => EMPTY),
        );
      }),
    );
  });

  removeNotificationSub$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(removeNotificationSub),
      mergeMap((action) => {
        return this.adminApiService.deleteSub(action.code).pipe(
          map(() => deleteSub()),
          catchError(() => EMPTY),
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
