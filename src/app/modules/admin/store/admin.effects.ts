import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { createEffect, ofType, Actions } from '@ngrx/effects';
import { EMPTY } from 'rxjs';
import { map, mergeMap, catchError, switchMap } from 'rxjs/operators';
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
            return [setRestaurant({ restaurant }), fetchRestaurantCommands({ code: restaurant.code, year: new Date().getFullYear().toString() })];
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
        return this.homeApiService.getAllPastries(action.code).pipe(
          map((pastries) => setAllPastries({ pastries })),
          catchError(() => EMPTY)
        );
      })
    )
  );

  constructor(
    private actions$: Actions,
    private router: Router,
    private homeApiService: HomeApiService,
    private adminApiService: AdminApiService,
    private restaurantApiService: RestaurantApiService,
  ) { }
}
