import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { catchError, mergeMap, switchMap } from 'rxjs/operators';
import { ProfileApiService } from 'src/app/modules/profile/services/profile-api.service';
import { AppState } from 'src/app/store/app.state';
import { changingPassword, setChangePasswordError, setPasswordAsChanged, stopLoading,
} from './profile.actions';

@Injectable()
export class ProfileEffects {
  changingPassword$ = createEffect(() =>
    this.actions$.pipe(
      ofType(changingPassword),
      mergeMap(({ oldPassword, password }) => {
        return this.profileApiService.postChangePassword(oldPassword, password).pipe(
          switchMap((changed: boolean) => {
            return [stopLoading(), setPasswordAsChanged({ changed })];
          }),
          catchError((error) => {
            if (error.code === 'old-password-not-ok') {
              return [stopLoading(), setChangePasswordError({ error: true }), setPasswordAsChanged({ changed: false })];
            } else {
              return [stopLoading(), setPasswordAsChanged({ changed: false })];
            }
          })
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
