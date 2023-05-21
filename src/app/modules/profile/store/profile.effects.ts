import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { catchError, mergeMap, switchMap } from 'rxjs/operators';
import { ProfileApiService } from 'src/app/modules/profile/services/profile-api.service';
import { AppState } from 'src/app/store/app.state';
import {
  changingPassword, setChangePasswordError,
  setPasswordAsChanged, stopLoading, updatingDisplayDemoResto,
} from './profile.actions';
import { toggleDisplayDemoResto } from 'src/app/modules/login/store/login.actions';

@Injectable()
export class ProfileEffects {
  changingPassword$ = createEffect(() =>
    this.actions$.pipe(
      ofType(changingPassword),
      mergeMap(({ oldPassword, password }) => {
        return this.profileApiService.postChangePassword(oldPassword, password).pipe(
          switchMap((changed: boolean) => {
            return [setPasswordAsChanged({ changed }), stopLoading()];
          }),
          catchError((error) => {
            if (error.code === 'old-password-not-ok') {
              return [setChangePasswordError({ error: true }), setPasswordAsChanged({ changed: false }), stopLoading()];
            } else {
              return [setPasswordAsChanged({ changed: false }), stopLoading()];
            }
          })
        );
      })
    )
  );

  updatingDisplayDemoResto$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updatingDisplayDemoResto),
      mergeMap((action) => {
        return this.profileApiService
          .patchDisplayDemoResto(action.displayDemoResto)
          .pipe(
            switchMap((displayDemoResto) => [toggleDisplayDemoResto({ displayDemoResto }), stopLoading()]),
          );
      })
    )
  );

  constructor(
    private actions$: Actions,
    private profileApiService: ProfileApiService,
    private store$: Store<AppState>,
  ) {}
}
