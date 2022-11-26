import { Injectable } from '@angular/core';
import { createEffect, ofType, Actions } from '@ngrx/effects';
import { debounceTime, map, mergeMap, switchMap } from 'rxjs/operators';
import { CoreUser } from 'src/app/interfaces/user.interface';
import { LoginApiService } from 'src/app/modules/login/services/login-api.service';
import { createUser, postPassword, setNewUser, setToken, setUserEmailError, setUserNoEmailError, validateUserEmail } from './login.actions';

@Injectable()
export class LoginEffects {
  postPassword$ = createEffect(() =>
    this.actions$.pipe(
      ofType(postPassword),
      map((action) => {
        localStorage.setItem('token', action.password);
        return setToken({ token: action.password });
      })
    )
  );

  postUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(createUser),
      mergeMap((action: { user: CoreUser }) => {
        return this.loginApiService.postUser(action.user).pipe(
          switchMap((user) => {
            return [setNewUser({ user })];
          })
        );
      })
    )
  );

  validateUserEmail$ = createEffect(() =>
    this.actions$.pipe(
      ofType(validateUserEmail),
      debounceTime(500),
      mergeMap((action: { email: string }) => {
        return this.loginApiService.validateUserEmail(action.email).pipe(
          switchMap((isValid: boolean) => {
            if (isValid) {
              return [setUserNoEmailError()];
            } else {
              return [setUserEmailError({ error: true, duplicated: true })];
            }
          })
        );
      })
    )
  );

  constructor(
    private actions$: Actions,
    private loginApiService: LoginApiService,
  ) {}
}
