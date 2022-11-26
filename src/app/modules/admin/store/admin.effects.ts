import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { createEffect, ofType, Actions } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { EMPTY, pipe } from 'rxjs';
import { map, mergeMap, catchError, switchMap, debounceTime, withLatestFrom, filter } from 'rxjs/operators';
import { CorePastry, Pastry } from 'src/app/interfaces/pastry.interface';
import { selectRestaurant } from 'src/app/modules/home/store/home.selectors';
import { AppState } from 'src/app/store/app.state';
import { HomeApiService } from '../../home/services/home-api.service';
import { setRestaurant } from '../../home/store/home.actions';
import { RestaurantApiService } from '../../restaurant/services/restaurant-api.service';
import { AdminApiService } from '../services/admin-api.service';
import {
  closeCommand,
  editCommand,
  setCommands,
  notificationSubSent,
  sendNotificationSub,
  payedCommand,
  fetchRestaurant,
  fetchRestaurantCommands,
  fetchAllRestaurantPastries,
  setAllPastries,
  setPastryNoNameError,
  setPastryNameError,
  validatePastryName,
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
} from './admin.actions';

@Injectable()
export class AdminEffects {
  fetchRestaurantCommands$ = createEffect(() =>
    this.actions$.pipe(
      ofType(fetchRestaurantCommands),
      mergeMap((action) => {
        const token = localStorage.getItem('token') as string;
        return this.adminApiService.getCommandsByCode(token, action.code, action.year).pipe(
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

  fetchRestaurant$ = createEffect(() =>
    this.actions$.pipe(
      ofType(fetchRestaurant),
      mergeMap((action: { code: string }) => {
        return this.restaurantApiService.getRestaurant(action.code).pipe(
          switchMap((restaurant) => {
            return [setRestaurant({ restaurant }), fetchAllRestaurantPastries({ code: restaurant.code }), fetchRestaurantCommands({ code: restaurant.code, year: new Date().getFullYear().toString() })];
          }),
          catchError((error) => {
            if (error.status === 404) {
              this.router.navigate(['page', '404']);
            }

            return EMPTY;
          })
        );
      })
    )
  );

  fetchAllRestaurantPastries$ = createEffect(() =>
    this.actions$.pipe(
      ofType(fetchAllRestaurantPastries),
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

  validatePastryName$ = createEffect(() =>
    this.actions$.pipe(
      ofType(validatePastryName),
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

  constructor(
    private actions$: Actions,
    private store$: Store<AppState>,
    private router: Router,
    private adminApiService: AdminApiService,
    private restaurantApiService: RestaurantApiService,
  ) { }
}
