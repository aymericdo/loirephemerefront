import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { EMPTY } from 'rxjs';
import { catchError, map, mergeMap, switchMap } from 'rxjs/operators';
import { AdminApiService } from 'src/app/modules/admin/services/admin-api.service';
import {
  closingCommand,
  editCommand,
  fetchingRestaurantCommands,
  notificationSubSent,
  payingCommand,
  removeNotificationSub,
  removeNotificationSubSent,
  sendNotificationSub,
  setCommands,
  stopLoading,
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
      mergeMap((action) => {
        return this.adminApiService
          .closeCommand(action.command.id!)
          .pipe(
            map((command) => editCommand({ command })),
          );
      })
    )
  );

  payingCommand$ = createEffect(() =>
    this.actions$.pipe(
      ofType(payingCommand),
      mergeMap((action) => {
        return this.adminApiService
          .payedCommand(action.command.id!)
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
          map(() => notificationSubSent()),
          catchError(() => EMPTY)
        );
      })
    )
  );

  removeNotificationSub$ = createEffect(() =>
    this.actions$.pipe(
      ofType(removeNotificationSub),
      mergeMap((action) => {
        return this.adminApiService.deleteSub(action.sub, action.code).pipe(
          map(() => removeNotificationSubSent()),
          catchError(() => EMPTY)
        );
      })
    )
  );

  constructor(
    private actions$: Actions,
    private adminApiService: AdminApiService,
  ) { }
}
