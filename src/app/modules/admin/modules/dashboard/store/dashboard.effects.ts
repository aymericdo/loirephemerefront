import { Injectable } from '@angular/core';
import { createEffect, ofType, Actions } from '@ngrx/effects';
import { concatLatestFrom } from '@ngrx/operators';
import { Store } from '@ngrx/store';
import { concatMap, filter, map } from 'rxjs';
import { setRestaurant } from 'src/app/auth/store/auth.actions';
import { selectRestaurant } from 'src/app/auth/store/auth.selectors';
import { fetchingData, getCommandsCountSuccess, getUsersCountSuccess, setCommandsCount, setPayedCommandsCount, setUsersCount, startLoading, stopLoading } from 'src/app/modules/admin/modules/dashboard/store/dashboard.actions';
import { AdminApiService } from 'src/app/modules/admin/services/admin-api.service';

@Injectable()
export class DashboardEffects {
  fetchingUsersCount$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(fetchingData),
      concatLatestFrom(() =>
        this.store.select(selectRestaurant).pipe(filter(Boolean)),
      ),
      concatMap(([, restaurant]) => {
        return this.adminApiService.getUsersCount(restaurant.code).pipe(
          map((count) => getUsersCountSuccess({ usersCount: count })),
        );
      }),
    );
  });

  fetchingCommandsCount$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(fetchingData),
      concatLatestFrom(() =>
        this.store.select(selectRestaurant).pipe(filter(Boolean)),
      ),
      concatMap(([, restaurant]) => {
        return this.adminApiService.getCommandsCount(restaurant.code).pipe(
          map((count) => getCommandsCountSuccess(count)),
        );
      }),
    );
  });

  setUsersCount$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(getUsersCountSuccess),
      map(({ usersCount }) => setUsersCount({ usersCount })),
    );
  });

  setCommandsCount$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(getCommandsCountSuccess),
      map(({ total }) => setCommandsCount({ commandsCount: total })),
    );
  });

  setPayedCommandsCount$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(getCommandsCountSuccess),
      map(({ payed }) => setPayedCommandsCount({ payedCommandsCount: payed })),
    );
  });

  startLoading$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(setRestaurant),
      map(() => startLoading()),
    );
  });

  stopLoading$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(getUsersCountSuccess, getCommandsCountSuccess),
      map(() => stopLoading()),
    );
  });

  constructor(
    private actions$: Actions,
    private store: Store,
    private adminApiService: AdminApiService,
  ) { }
}
