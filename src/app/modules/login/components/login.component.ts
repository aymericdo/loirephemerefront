import { Component, OnInit } from '@angular/core';
import { ActivationEnd, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { filter, Observable, ReplaySubject, takeUntil } from 'rxjs';
import { Restaurant } from 'src/app/interfaces/restaurant.interface';
import { selectUserRestaurants } from 'src/app/modules/login/store/login.selectors';
import { AppState } from 'src/app/store/app.state';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  userRestaurants$!: Observable<Restaurant[] | null>;
  isOnRecover = false;

  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  constructor(
    private router: Router,
    private store: Store<AppState>,
  ) { }

  ngOnInit(): void {
    this.isOnRecover = this.router.url === '/page/login/recover';
    this.userRestaurants$ = this.store.select(selectUserRestaurants);
    this.userRestaurants$.pipe(
      filter(Boolean),
      takeUntil(this.destroyed$),
    ).subscribe((restaurants) => {
      if (restaurants.length) {
        this.router.navigate([restaurants[0].code, 'admin', 'menu']);
      } else {
        this.router.navigate(['page', 'restaurant', 'new']);
      }
    })

    this.router.events
      .pipe(
        filter(e => (e instanceof ActivationEnd)),
      )
      .subscribe(() => {
        this.isOnRecover = this.router.url === '/page/login/recover';
      });
  }
}
