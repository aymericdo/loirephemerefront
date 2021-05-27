import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { createEffect, ofType, Actions } from '@ngrx/effects';
import { map } from 'rxjs/operators';
import { postPassword, setToken } from './login.actions';

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

  constructor(private actions$: Actions, public router: Router) {}
}
