import { Injectable } from '@angular/core';
import { createEffect, ofType, Actions } from '@ngrx/effects';
import { EMPTY } from 'rxjs';
import { map, mergeMap, catchError } from 'rxjs/operators';
import { HomeApiService } from '../services/home-api.service';
import { fetchPastries, setPastries } from './home.actions';

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

  constructor(
    private actions$: Actions,
    private homeApiService: HomeApiService
  ) {}
}
