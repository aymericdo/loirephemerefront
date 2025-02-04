import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { EMPTY } from 'rxjs';
import { catchError, concatMap, debounceTime, filter, map, switchMap } from 'rxjs/operators';
import { concatLatestFrom } from '@ngrx/operators';
import { Access, User } from 'src/app/interfaces/user.interface';
import { AdminApiService } from 'src/app/modules/admin/services/admin-api.service';
import { selectRestaurant } from 'src/app/auth/store/auth.selectors';
import {
  addUser, addingUserToRestaurant, deleteUser,
  deletingUserToRestaurant,
  fetchingUsers,
  patchUserRestaurantAccessSuccess,
  patchingUserRestaurantAccess,
  setUser,
  setUserEmailError,
  setUserNoEmailError,
  setUsers,
  stopLoading,
  validatingUserEmail,
} from './users.actions';

import { setUserAccess } from 'src/app/auth/store/auth.actions';
import { selectUser } from 'src/app/auth/store/auth.selectors';

@Injectable()
export class UsersEffects {
  fetchingUsers$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(fetchingUsers),
      concatMap((action) => {
        return this.adminApiService.getAllUsers(action.code).pipe(
          map((users) => setUsers({ users })),
          catchError(() => EMPTY),
        );
      }),
    );
  });

  validatingUserEmail$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(validatingUserEmail),
      debounceTime(500),
      switchMap((action: { email: string }) => {
        return this.adminApiService.validateUserEmail(action.email).pipe(
          map((isValid: boolean) => {
            return (isValid) ?
              setUserNoEmailError() :
              setUserEmailError({ error: true, notExists: true });
          }),
        );
      }),
    );
  });

  addingUserToRestaurant$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(addingUserToRestaurant),
      concatLatestFrom(() =>
        this.store.select(selectRestaurant).pipe(filter(Boolean)),
      ),
      concatMap(([action, restaurant]) => {
        return this.adminApiService.postUserToRestaurant(restaurant.code, action.email).pipe(
          map((user: User) => addUser({ user })),
        );
      }),
    );
  });

  deletingUserToRestaurant$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(deletingUserToRestaurant),
      concatLatestFrom(() =>
        this.store.select(selectRestaurant).pipe(filter(Boolean)),
      ),
      concatMap(([action, restaurant]) => {
        return this.adminApiService.deleteUserToRestaurant(restaurant.code, action.userId).pipe(
          map((isDone: boolean) => {
            if (isDone) {
              return deleteUser({ userId: action.userId });
            }
            throw 'user not deleted';
          }),
          catchError(() => EMPTY),
        );
      }),
    );
  });

  patchingUserRestaurantAccess$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(patchingUserRestaurantAccess),
      concatLatestFrom(() => [
        this.store.select(selectRestaurant).pipe(filter(Boolean)),
      ]),
      concatMap(([action, restaurant]) => {
        return this.adminApiService.patchUserRestaurantAccess(restaurant.code, action.userId, action.access).pipe(
          map((user: User) => patchUserRestaurantAccessSuccess({ user })),
        );
      }),
    );
  });

  setUser$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(patchUserRestaurantAccessSuccess),
      map(({ user }) => setUser({ user })),
    );
  });

  setUserAccess$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(patchUserRestaurantAccessSuccess),
      concatLatestFrom(() => [
        this.store.select(selectRestaurant).pipe(filter(Boolean)),
        this.store.select(selectUser).pipe(filter(Boolean)),
      ]),
      map(([action, restaurant, currentUser]) => {
        if (action.user.id === currentUser.id) {
          return setUserAccess({
            access: action.user.access as Access[],
            restaurantId: restaurant.id,
          });
        }

        throw 'is not the current user';
      }),
      catchError(() => EMPTY),
    );
  });

  stopLoading$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(setUsers),
      map(() => stopLoading()),
    );
  });

  constructor(
    private store: Store,
    private actions$: Actions,
    private adminApiService: AdminApiService,
  ) { }
}
