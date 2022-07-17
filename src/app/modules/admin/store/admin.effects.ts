import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { createEffect, ofType, Actions } from '@ngrx/effects';
import { EMPTY } from 'rxjs';
import { map, mergeMap, catchError } from 'rxjs/operators';
import { AdminApiService } from '../services/admin-api.service';
import {
  closeCommand,
  editCommand,
  fetchCommands,
  setCommands,
  notificationSubSent,
  sendNotificationSub,
  payedCommand,
} from './admin.actions';

@Injectable()
export class AdminEffects {
  fetchCommands$ = createEffect(() =>
    this.actions$.pipe(
      ofType(fetchCommands),
      mergeMap(() => {
        const token = localStorage.getItem('token') as string;
        return this.adminApiService.getAll(token).pipe(
          map((commands) => setCommands({ commands })),
          catchError(() => {
            localStorage.removeItem('token');
            this.router.navigate(['/']);
            return EMPTY;
          })
        );
      })
    )
  );

  closeCommand$ = createEffect(() =>
    this.actions$.pipe(
      ofType(closeCommand),
      mergeMap((action) => {
        const token = localStorage.getItem('token') as string;
        return this.adminApiService
          .closeCommand(token, action.command._id!)
          .pipe(
            map((command) => editCommand({ command })),
            catchError(() => {
              localStorage.removeItem('token');
              this.router.navigate(['/']);
              return EMPTY;
            })
          );
      })
    )
  );

  payedCommand$ = createEffect(() =>
    this.actions$.pipe(
      ofType(payedCommand),
      mergeMap((action) => {
        const token = localStorage.getItem('token') as string;
        return this.adminApiService
          .payedCommand(token, action.command._id!)
          .pipe(
            map((command) => editCommand({ command })),
            catchError(() => {
              localStorage.removeItem('token');
              this.router.navigate(['/']);
              return EMPTY;
            })
          );
      })
    )
  );

  sendNotificationSub$ = createEffect(() =>
    this.actions$.pipe(
      ofType(sendNotificationSub),
      mergeMap((action) => {
        return this.adminApiService.postSub(action.sub).pipe(
          map(() => notificationSubSent()),
          catchError(() => EMPTY)
        );
      })
    )
  );

  constructor(
    private actions$: Actions,
    public router: Router,
    private adminApiService: AdminApiService
  ) { }
}
