import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, concatMap, map } from 'rxjs/operators';
import { ProfileApiService } from 'src/app/modules/profile/services/profile-api.service';
import {
  changingPassword, setChangePasswordError,
  setPasswordAsChanged, stopLoading, toggleDisplayDemoResto, toggleWaiterMode, updatingDisplayDemoResto,
  updatingWaiterMode,
} from './profile.actions';

@Injectable()
export class ProfileEffects {
  changingPassword$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(changingPassword),
      concatMap(({ oldPassword, password }) => {
        return this.profileApiService.postChangePassword(oldPassword, password).pipe(
          map((changed: boolean) => setPasswordAsChanged({ changed })),
          catchError((error) => {
            if (error.code === 'old-password-not-ok') {
              return [setChangePasswordError({ error: true })];
            } else {
              return [setPasswordAsChanged({ changed: false })];
            }
          }),
        );
      }),
    );
  });

  setPasswordAsNotChanged$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(setChangePasswordError),
      map(() => setPasswordAsChanged({ changed: false })),
    );
  });

  updatingDisplayDemoResto$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(updatingDisplayDemoResto),
      concatMap((action) => {
        return this.profileApiService
          .patchDisplayDemoResto(action.displayDemoResto)
          .pipe(map((displayDemoResto) => toggleDisplayDemoResto({ displayDemoResto })));
      }),
    );
  });

  updatingWaiterMode$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(updatingWaiterMode),
      concatMap((action) => {
        return this.profileApiService
          .patchWaiterMode(action.waiterMode)
          .pipe(map((waiterMode) => toggleWaiterMode({ waiterMode })));
      }),
    );
  });

  stopLoading$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(setPasswordAsChanged, toggleDisplayDemoResto),
      map(() => stopLoading()),
    );
  });

  constructor(
    private actions$: Actions,
    private profileApiService: ProfileApiService,
  ) {}
}
