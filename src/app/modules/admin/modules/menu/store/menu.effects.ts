import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { EMPTY, pipe } from 'rxjs';
import { catchError, debounceTime, filter, mergeMap, switchMap, withLatestFrom } from 'rxjs/operators';
import { Pastry } from 'src/app/interfaces/pastry.interface';
import { AdminApiService } from 'src/app/modules/admin/services/admin-api.service';
import { selectRestaurant } from 'src/app/modules/home/store/home.selectors';
import { RestaurantApiService } from 'src/app/modules/restaurant/services/restaurant-api.service';
import { AppState } from 'src/app/store/app.state';
import {
  activatingPastry,
  addPastry,
  closeMenuModal,
  deactivatingPastry,
  decrementPastry,
  editPastry,
  editingPastry,
  fetchingAllRestaurantPastries,
  incrementPastry,
  movingPastry,
  openMenuModal,
  pastryCreated,
  pastryEdited,
  pastryMoved,
  postingPastry,
  reactivatePastryName,
  reorderPastries,
  setAllPastries,
  setPastryNameError,
  setPastryNoNameError,
  settingCommonStock,
  stopLoading,
  validatingPastryName,
} from './menu.actions';

@Injectable()
export class MenuEffects {
  fetchingAllRestaurantPastries$ = createEffect(() =>
    this.actions$.pipe(
      ofType(fetchingAllRestaurantPastries),
      mergeMap((action) => {
        return this.adminApiService.getAllPastries(action.code).pipe(
          switchMap((pastries) => [
            stopLoading(),
            setAllPastries({ pastries }),
          ]),
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
        return this.adminApiService.validatePastryIsAlreadyOrdered(restaurant.code, action.pastry?.id!).pipe(
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
          catchError(() => {
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
              return [
                editPastry({ pastry: data.pastry }),
                pastryEdited(),
                closeMenuModal(),
                reorderPastries({ sequence: data.displaySequenceById }),
              ];
            } else {
              return [editPastry({ pastry: data.pastry }), pastryEdited(), closeMenuModal()];
            }
          }),
          catchError(() => {
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
          catchError(() => {
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
            return [stopLoading(), setAllPastries({ pastries })];
          }),
          catchError(() => {
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
          catchError(() => {
            return [pastryEdited()];
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
