import { Injectable } from '@angular/core';
import { createEffect, ofType, Actions } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { EMPTY, pipe } from 'rxjs';
import { map, mergeMap, catchError, switchMap, debounceTime, withLatestFrom, filter } from 'rxjs/operators';
import { Pastry } from 'src/app/interfaces/pastry.interface';
import { User } from 'src/app/interfaces/user.interface';
import { selectRestaurant } from 'src/app/modules/home/store/home.selectors';
import { AppState } from 'src/app/store/app.state';
import { setRestaurant } from '../../home/store/home.actions';
import { RestaurantApiService } from '../../restaurant/services/restaurant-api.service';
import { AdminApiService } from '../services/admin-api.service';
import {
  closingCommand,
  editCommand,
  setCommands,
  notificationSubSent,
  sendNotificationSub,
  payingCommand,
  fetchingRestaurant,
  fetchingRestaurantCommands,
  fetchingAllRestaurantPastries,
  setAllPastries,
  setPastryNoNameError,
  setPastryNameError,
  validatingPastryName,
  postingPastry,
  addPastry,
  pastryCreated,
  closeMenuModal,
  editingPastry,
  editPastry,
  pastryEdited,
  activatingPastry,
  deactivatingPastry,
  movingPastry,
  reorderPastries,
  pastryMoved,
  incrementPastry,
  decrementPastry,
  openMenuModal,
  reactivatePastryName,
  fetchingUsers,
  setUsers,
  validatingUserEmail,
  setUserEmailError,
  setUserNoEmailError,
  addingUserToRestaurant,
  addUser,
  deletingUserToRestaurant,
  deleteUser,
  removeNotificationSub,
  removeNotificationSubSent,
  settingCommonStock,
  stopStatsLoading,
} from './admin.actions';

@Injectable()
export class AdminEffects {
  fetchingRestaurantCommands$ = createEffect(() =>
    this.actions$.pipe(
      ofType(fetchingRestaurantCommands),
      mergeMap((action) => {
        return this.adminApiService.getCommandsByCode(action.code, action.fromDate, action.toDate).pipe(
          switchMap((commands) => {
            return [setCommands({ commands }), stopStatsLoading()]
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
          .closeCommand(action.command._id!)
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
          .payedCommand(action.command._id!)
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

  fetchingRestaurant$ = createEffect(() =>
    this.actions$.pipe(
      ofType(fetchingRestaurant),
      mergeMap((action: { code: string }) => {
        return this.restaurantApiService.getRestaurant(action.code).pipe(
          switchMap((restaurant) => {
            return [
              setRestaurant({ restaurant }),
              fetchingAllRestaurantPastries({ code: restaurant.code }),
            ];
          }),
        );
      })
    )
  );

  fetchingAllRestaurantPastries$ = createEffect(() =>
    this.actions$.pipe(
      ofType(fetchingAllRestaurantPastries),
      mergeMap((action) => {
        return this.adminApiService.getAllPastries(action.code).pipe(
          map((pastries) => setAllPastries({ pastries })),
          catchError(() => EMPTY)
        );
      })
    )
  );

  openMenuModal$ = createEffect(() =>
    this.actions$.pipe(
      ofType(openMenuModal),
      pipe(
        filter((value) => value.modal === 'edit')
      ),
      withLatestFrom(
        this.store$.select(selectRestaurant).pipe(filter(Boolean)),
      ),
      mergeMap(([action, restaurant]) => {
        return this.adminApiService.validatePastryIsAlreadyOrdered(restaurant.code, action.pastry?._id!).pipe(
          switchMap((isNotValid: boolean) => {
            if (isNotValid) {
              // By default, in edit mode, name is deactivated
              return EMPTY;
            }

            return [reactivatePastryName()];
          })
        );
      })
    )
  );

  validatingPastryName$ = createEffect(() =>
    this.actions$.pipe(
      ofType(validatingPastryName),
      debounceTime(500),
      withLatestFrom(
        this.store$.select(selectRestaurant).pipe(filter(Boolean)),
      ),
      mergeMap(([action, restaurant]) => {
        return this.adminApiService.validatePastryName(restaurant.code, action.pastryName).pipe(
          switchMap((isValid: boolean) => {
            if (isValid) {
              return [setPastryNoNameError()];
            } else {
              return [setPastryNameError({ error: true, duplicated: true })];
            }
          })
        );
      })
    )
  );

  postingPastry$ = createEffect(() =>
    this.actions$.pipe(
      ofType(postingPastry),
      withLatestFrom(
        this.store$.select(selectRestaurant).pipe(filter(Boolean)),
      ),
      mergeMap(([action, restaurant]) => {
        return this.adminApiService.postPastry(restaurant.code, action.pastry).pipe(
          switchMap((pastry: Pastry) => {
            return [addPastry({ pastry }), pastryCreated(), closeMenuModal()];
          }),
          catchError((error) => {
            console.error(error);
            return [pastryCreated()];
          })
        );
      })
    )
  );

  editingPastry$ = createEffect(() =>
    this.actions$.pipe(
      ofType(editingPastry),
      withLatestFrom(
        this.store$.select(selectRestaurant).pipe(filter(Boolean)),
      ),
      mergeMap(([action, restaurant]) => {
        return this.adminApiService.putPastry(restaurant.code, action.pastry).pipe(
          switchMap((data: { pastry: Pastry, displaySequenceById?: { [pastryId: string]: number } }) => {
            if (data.displaySequenceById) {
              return [editPastry({ pastry: data.pastry }), pastryEdited(), closeMenuModal(), reorderPastries({ sequence: data.displaySequenceById })];
            } else {
              return [editPastry({ pastry: data.pastry }), pastryEdited(), closeMenuModal()];
            }
          }),
          catchError((error) => {
            console.error(error);
            return [pastryEdited()];
          })
        );
      })
    )
  );

  movingPastry$ = createEffect(() =>
    this.actions$.pipe(
      ofType(movingPastry),
      withLatestFrom(
        this.store$.select(selectRestaurant).pipe(filter(Boolean)),
      ),
      mergeMap(([action, restaurant]) => {
        return this.adminApiService.putPastry(restaurant.code, action.pastry).pipe(
          switchMap((data: { pastry: Pastry, displaySequenceById?: { [pastryId: string]: number } }) => {
            if (data.displaySequenceById) {
              return [
                editPastry({ pastry: data.pastry }),
                reorderPastries({ sequence: data.displaySequenceById }),
                pastryMoved({ pastry: data.pastry })
              ];
            } else {
              return [editPastry({ pastry: data.pastry })];
            }
          }),
          catchError((error) => {
            console.error(error);
            return [pastryEdited()];
          })
        );
      })
    )
  );

  settingCommonStock$ = createEffect(() =>
    this.actions$.pipe(
      ofType(settingCommonStock),
      withLatestFrom(
        this.store$.select(selectRestaurant).pipe(filter(Boolean)),
      ),
      mergeMap(([action, restaurant]) => {
        return this.adminApiService.putEditCommonStockPastry(restaurant.code, action.pastries, action.commonStock).pipe(
          switchMap((pastries: Pastry[]) => {
            return [setAllPastries({ pastries })]
          }),
          catchError((error) => {
            console.error(error);
            return [pastryEdited()];
          })
        );
      })
    )
  );

  patchingPastry$ = createEffect(() =>
    this.actions$.pipe(
      ofType(activatingPastry, deactivatingPastry, incrementPastry, decrementPastry),
      withLatestFrom(
        this.store$.select(selectRestaurant).pipe(filter(Boolean)),
      ),
      mergeMap(([action, restaurant]) => {
        return this.adminApiService.putPastry(restaurant.code, action.pastry).pipe(
          switchMap(({ pastry }) => {
            return [editPastry({ pastry })];
          }),
          catchError((error) => {
            console.error(error);
            return [pastryEdited()];
          })
        );
      })
    )
  );

  fetchingUsers$ = createEffect(() =>
    this.actions$.pipe(
      ofType(fetchingUsers),
      mergeMap((action) => {
        return this.adminApiService.getAllUsers(action.code).pipe(
          switchMap((users) => {
            return [setUsers({ users })];
          }),
          catchError((error) => {
            console.error(error);
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
    private actions$: Actions,
    private store$: Store<AppState>,
    private adminApiService: AdminApiService,
    private restaurantApiService: RestaurantApiService,
  ) { }
}
