import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { EMPTY, pipe } from 'rxjs';
import { catchError, concatMap, debounceTime, filter, map, mergeMap, switchMap } from 'rxjs/operators';
import { concatLatestFrom } from '@ngrx/operators';
import { Pastry } from 'src/app/interfaces/pastry.interface';
import { AdminApiService } from 'src/app/modules/admin/services/admin-api.service';
import { selectRestaurant } from 'src/app/modules/login/store/login.selectors';
import {
  activatingPastry,
  addPastry,
  closeMenuModal,
  deactivatePastryName,
  deactivatingPastry,
  decrementPastry, editPastry, editingPastry, fetchingAllRestaurantPastries,
  incrementPastry,
  movingPastry,
  openMenuModal,
  pastryMoved,
  postingPastry,
  putPastrySuccess,
  reactivatePastryName,
  reorderPastries,
  setAllPastries,
  setPastryNameError,
  setPastryNoNameError,
  settingCommonStock,
  startLoading,
  stopLoading,
  stopSavingPastry,
  validatingPastryName,
} from './menu.actions';

@Injectable()
export class MenuEffects {
  startLoading$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(fetchingAllRestaurantPastries),
      map(() => startLoading()),
    );
  });

  fetchingAllRestaurantPastries$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(fetchingAllRestaurantPastries),
      mergeMap((action) => {
        return this.adminApiService.getAllPastries(action.code).pipe(
          map((pastries) => setAllPastries({ pastries })),
          catchError(() => EMPTY),
        );
      }),
    );
  });

  stopLoading$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(setAllPastries),
      map(() => stopLoading()),
    );
  });

  openEditMenuModal$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(openMenuModal),
      pipe(filter((value) => value.modal === 'edit')),
      concatLatestFrom(() =>
        this.store.select(selectRestaurant).pipe(filter(Boolean)),
      ),
      concatMap(([action, restaurant]) => {
        return this.adminApiService.validatePastryIsAlreadyOrdered(restaurant.code, action.pastry?.id!).pipe(
          map((isAlreadyOrdered: boolean) => {
            if (isAlreadyOrdered) {
              return deactivatePastryName();
            }

            return reactivatePastryName();
          }),
        );
      }),
    );
  });

  openAddMenuModal$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(openMenuModal),
      pipe(filter((value) => value.modal === 'new')),
      map(() => reactivatePastryName()),
    );
  });

  validatingPastryName$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(validatingPastryName),
      debounceTime(500),
      concatLatestFrom(() =>
        this.store.select(selectRestaurant).pipe(filter(Boolean)),
      ),
      switchMap(([action, restaurant]) => {
        return this.adminApiService.validatePastryName(restaurant.code, action.pastryName, action.pastryId).pipe(
          map((isValid: boolean) => {
            return (isValid) ?
              setPastryNoNameError() :
              setPastryNameError({ error: true, duplicated: true });
          }),
        );
      }),
    );
  });

  postingPastry$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(postingPastry),
      concatLatestFrom(() =>
        this.store.select(selectRestaurant).pipe(filter(Boolean)),
      ),
      concatMap(([action, restaurant]) => {
        return this.adminApiService.postPastry(restaurant.code, action.pastry).pipe(
          map((pastry: Pastry) => addPastry({ pastry })),
          catchError(() => [stopSavingPastry()]),
        );
      }),
    );
  });

  stopSavingPastryAfterAdd$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(addPastry),
      map(() => stopSavingPastry()),
    );
  });

  closeAddMenuModal$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(addPastry),
      map(() => closeMenuModal()),
    );
  });

  editingPastry$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(editingPastry),
      concatLatestFrom(() =>
        this.store.select(selectRestaurant).pipe(filter(Boolean)),
      ),
      concatMap(([action, restaurant]) => {
        return this.adminApiService.putPastry(restaurant.code, action.pastry).pipe(
          map((data: { pastry: Pastry, displaySequenceById?: { [pastryId: string]: number } }) => {
            return putPastrySuccess(data);
          }),
          catchError(() => [stopSavingPastry()]),
        );
      }),
    );
  });

  movingPastry$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(movingPastry),
      concatLatestFrom(() =>
        this.store.select(selectRestaurant).pipe(filter(Boolean)),
      ),
      concatMap(([action, restaurant]) => {
        return this.adminApiService.putPastry(restaurant.code, action.pastry).pipe(
          map((data: { pastry: Pastry, displaySequenceById?: { [pastryId: string]: number } }) => {
            return putPastrySuccess(data);
          }),
          catchError(() => [stopSavingPastry()]),
        );
      }),
    );
  });

  editPastry$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(putPastrySuccess),
      map((data) => {
        return editPastry({ pastry: data.pastry });
      }),
    );
  });

  stopSavingPastryAfterEdit$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(editPastry),
      map(() => stopSavingPastry()),
    );
  });

  closeEditMenuModal$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(editPastry),
      map(() => closeMenuModal()),
    );
  });

  reorderPastries$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(putPastrySuccess),
      map((data) => {
        if (data.displaySequenceById) {
          return reorderPastries({ sequence: data.displaySequenceById });
        }

        throw 'no displaySequenceById';
      }),
      catchError(() => EMPTY),
    );
  });

  pastryMoved$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(putPastrySuccess),
      map((data) => {
        if (data.displaySequenceById && data.pastry) {
          return pastryMoved({ pastry: data.pastry });
        }

        throw 'no pastry moved';
      }),
      catchError(() => EMPTY),
    );
  });

  settingCommonStock$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(settingCommonStock),
      concatLatestFrom(() =>
        this.store.select(selectRestaurant).pipe(filter(Boolean)),
      ),
      concatMap(([action, restaurant]) => {
        return this.adminApiService.putEditCommonStockPastry(
          restaurant.code,
          action.pastries.map((p: Pastry) => p.id),
          action.commonStock,
        ).pipe(
          map((pastries: Pastry[]) => setAllPastries({ pastries })),
          catchError(() => [stopSavingPastry()]),
        );
      }),
    );
  });

  patchingPastry$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(activatingPastry, deactivatingPastry, incrementPastry, decrementPastry),
      concatLatestFrom(() =>
        this.store.select(selectRestaurant).pipe(filter(Boolean)),
      ),
      mergeMap(([action, restaurant]) => {
        return this.adminApiService.putPastry(restaurant.code, action.pastry).pipe(
          map(({ pastry }) => editPastry({ pastry })),
          catchError(() => [stopSavingPastry()]),
        );
      }),
    );
  });

  constructor(
    private actions$: Actions,
    private store: Store,
    private adminApiService: AdminApiService,
  ) { }
}
