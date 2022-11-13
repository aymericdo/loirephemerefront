import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { createEffect, ofType, Actions } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { EMPTY } from 'rxjs';
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
  setNoNameError,
  setNameError,
  validatePastryName,
  createPastry,
  addPastry,
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
              return [setNoNameError()];
            } else {
              return [setNameError({ error: true, duplicated: true })];
            }
          })
        );
      })
    )
  );

  createPastry$ = createEffect(() =>
    this.actions$.pipe(
      ofType(createPastry),
      withLatestFrom(
        this.store$.select(selectRestaurant).pipe(filter(Boolean)),
      ),
      mergeMap(([action, restaurant]) => {
        return this.adminApiService.createPastry(restaurant.code, action.pastry).pipe(
          switchMap((pastry: Pastry) => {
            return [addPastry({ pastry })];
          }),
          catchError((error) => {
            console.error(error);

            return EMPTY;
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
