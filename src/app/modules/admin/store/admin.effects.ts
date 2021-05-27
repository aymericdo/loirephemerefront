import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
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

  constructor(
    private actions$: Actions,
    public router: Router,
    private adminApiService: AdminApiService
  ) {}
}
