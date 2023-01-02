import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { EMPTY } from 'rxjs';
import { catchError, debounceTime, filter, mergeMap, switchMap, withLatestFrom } from 'rxjs/operators';
import { User } from 'src/app/interfaces/user.interface';
import { AdminApiService } from 'src/app/modules/admin/services/admin-api.service';
import { selectRestaurant } from 'src/app/modules/home/store/home.selectors';
import { AppState } from 'src/app/store/app.state';
import {
  addUser,
  addingUserToRestaurant,
  deleteUser,
  deletingUserToRestaurant,
  fetchingUsers,
  setUserEmailError,
  setUserNoEmailError,
  setUsers,
  validatingUserEmail,
} from './users.actions';

@Injectable()
export class UsersEffects {
  fetchingUsers$ = createEffect(() =>
    this.actions$.pipe(
      ofType(fetchingUsers),
      mergeMap((action) => {
        return this.adminApiService.getAllUsers(action.code).pipe(
          switchMap((users) => {
            return [setUsers({ users })];
          }),
          catchError(() => {
            return EMPTY;
          })
        );
      })
    )
  );

  validatingUserEmail$ = createEffect(() =>
    this.actions$.pipe(
      ofType(validatingUserEmail),
      debounceTime(500),
      mergeMap((action: { email: string }) => {
        return this.adminApiService.validateUserEmail(action.email).pipe(
          switchMap((isValid: boolean) => {
            if (isValid) {
              return [setUserNoEmailError()];
            } else {
              return [setUserEmailError({ error: true, notExists: true })];
            }
          })
        );
      })
    )
  );

  addingUserToRestaurant$ = createEffect(() =>
    this.actions$.pipe(
      ofType(addingUserToRestaurant),
      withLatestFrom(
        this.store$.select(selectRestaurant).pipe(filter(Boolean)),
      ),
      mergeMap(([action, restaurant]) => {
        return this.adminApiService.postUserToRestaurant(restaurant.code, action.email).pipe(
          switchMap((user: User) => {
            return [addUser({ user })];
          })
        );
      })
    )
  );

  deletingUserToRestaurant$ = createEffect(() =>
    this.actions$.pipe(
      ofType(deletingUserToRestaurant),
      withLatestFrom(
        this.store$.select(selectRestaurant).pipe(filter(Boolean)),
      ),
      mergeMap(([action, restaurant]) => {
        return this.adminApiService.deleteUserToRestaurant(restaurant.code, action.email).pipe(
          switchMap((isDone: boolean) => {
            return isDone ? [deleteUser({ userEmail: action.email })] : EMPTY;
          })
        );
      })
    )
  );

  constructor(
    private store$: Store<AppState>,
    private actions$: Actions,
    private adminApiService: AdminApiService,
  ) { }
}
