import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { EMPTY } from 'rxjs';
import { catchError, debounceTime, filter, mergeMap, switchMap, withLatestFrom } from 'rxjs/operators';
import { Access, User } from 'src/app/interfaces/user.interface';
import { AdminApiService } from 'src/app/modules/admin/services/admin-api.service';
import { selectRestaurant } from 'src/app/modules/login/store/login.selectors';
import { AppState } from 'src/app/store/app.state';
import {
  addUser, addingUserToRestaurant, deleteUser,
  deletingUserToRestaurant,
  fetchingUsers,
  patchingUserRestaurantAccess,
  setUser,
  setUserEmailError,
  setUserNoEmailError,
  setUsers,
  stopLoading,
  validatingUserEmail
} from './users.actions';

import { setUserAccess } from 'src/app/modules/login/store/login.actions';
import { selectUser } from 'src/app/modules/login/store/login.selectors';

@Injectable()
export class UsersEffects {
  fetchingUsers$ = createEffect(() =>
    this.actions$.pipe(
      ofType(fetchingUsers),
      mergeMap((action) => {
        return this.adminApiService.getAllUsers(action.code).pipe(
          switchMap((users) => {
            return [setUsers({ users }), stopLoading()];
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
        return this.adminApiService.deleteUserToRestaurant(restaurant.code, action.userId).pipe(
          switchMap((isDone: boolean) => {
            return isDone ? [deleteUser({ userId: action.userId })] : EMPTY;
          })
        );
      })
    )
  );

  patchingUserRestaurantAccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(patchingUserRestaurantAccess),
      withLatestFrom(
        this.store$.select(selectRestaurant).pipe(filter(Boolean)),
        this.store$.select(selectUser).pipe(filter(Boolean)),
      ),
      mergeMap(([action, restaurant, currentUser]) => {
        return this.adminApiService.patchUserRestaurantAccess(restaurant.code, action.userId, action.access).pipe(
          switchMap((user: User) => {
            if (user.id === currentUser.id) {
              return [
                setUser({ user }),
                setUserAccess({ access: user.access as Access[], restaurantId: restaurant.id })
              ];
            } else {
              return [setUser({ user })];
            }
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
