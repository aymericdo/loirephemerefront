import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivationEnd, NavigationEnd, Router, RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { ReplaySubject, combineLatest, filter, takeUntil, withLatestFrom } from 'rxjs';
import { Restaurant } from 'src/app/interfaces/restaurant.interface';
import { selectDemoResto, selectUser, selectUserRestaurants } from 'src/app/auth/store/auth.selectors';
import { RegisterComponent } from './register/register.component';
import { SignInComponent } from './sign-in/sign-in.component';
import { CommonModule } from '@angular/common';
import { RecoverComponent } from './recover/recover.component';
import { NgZorroModule } from 'src/app/shared/ngzorro.module';
import { stopLoading } from 'src/app/modules/login/store/login.actions';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  imports: [
    NgZorroModule,
    CommonModule,
    RouterLink,
    RegisterComponent,
    SignInComponent,
    RecoverComponent,
  ],
})
export class LoginComponent implements OnInit, OnDestroy {
  isOnRecover = false;

  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  constructor(
    private router: Router,
    private store: Store,
  ) { }

  ngOnInit(): void {
    this.isOnRecover = this.router.url === '/page/login/recover';

    combineLatest([
      this.store.select(selectUser).pipe(filter(Boolean)),
      this.store.select(selectDemoResto).pipe(filter(Boolean)),
      this.store.select(selectUserRestaurants).pipe(filter((restaurants) => !!restaurants?.length)),
    ]).pipe(
      takeUntil(this.destroyed$),
    ).subscribe(([user, demoResto, restaurants]) => {
      if (user && restaurants) {
        const restoList = restaurants.filter((resto: Restaurant) => resto.code !== demoResto.code);

        if (restoList.length) {
          this.router.navigate([restoList[0].code, 'admin']);
        } else {
          this.router.navigate(['page', 'restaurant', 'new']);
        }
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
