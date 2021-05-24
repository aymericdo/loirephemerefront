import { Injectable } from '@angular/core';
import { createEffect, ofType, Actions } from '@ngrx/effects';
import { EMPTY } from 'rxjs';
import { map, mergeMap, catchError } from 'rxjs/operators';
import { AdminApiService } from '../services/admin-api.service';
import { fetchCommands, setCommands } from './admin.actions';

@Injectable()
export class AdminEffects {
  fetchCommands$ = createEffect(() =>
    this.actions$.pipe(
      ofType(fetchCommands),
      mergeMap(() => {
        return this.adminApiService.getAll().pipe(
          map((commands) => setCommands({ commands })),
          catchError(() => EMPTY)
        );
      })
    )
  );

  constructor(
    private actions$: Actions,
    private adminApiService: AdminApiService
  ) {}
}
