import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivationEnd, NavigationEnd, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { ReplaySubject, filter, takeUntil, withLatestFrom } from 'rxjs';
import { stopLoading } from 'src/app/modules/login/store/login.actions';
import { selectDemoResto, selectUser } from 'src/app/modules/login/store/login.selectors';
import { AppState } from 'src/app/store/app.state';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {
  isOnRecover = false;

  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  constructor(
    private router: Router,
    private store: Store<AppState>,
  ) { }

  ngOnInit(): void {
    this.isOnRecover = this.router.url === '/page/login/recover';

    this.store.select(selectUser).pipe(
      filter(Boolean),
      withLatestFrom(this.store.select(selectDemoResto).pipe(filter(Boolean))),
      takeUntil(this.destroyed$),
    ).subscribe(([user, demoResto]) => {
      if (user) {
        this.router.navigate([demoResto.code, 'admin']);
      } else {
        this.router.navigate(['page', 'restaurant', 'new']);
      }
    });

    this.router.events
      .pipe(
        filter(e => (e instanceof NavigationEnd)),
        withLatestFrom(this.router.events
          .pipe(
            filter(e => (e instanceof ActivationEnd)),
          ),
        ),
      ).subscribe(() => {
        this.isOnRecover = this.router.url === '/page/login/recover';
      });
  }

  ngOnDestroy() {
    this.store.dispatch(stopLoading());
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
