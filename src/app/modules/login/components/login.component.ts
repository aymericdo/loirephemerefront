import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { filter, Observable, ReplaySubject, takeUntil } from 'rxjs';
import { Restaurant } from 'src/app/interfaces/restaurant.interface';
import { selectLoading, selectUserRestaurants } from 'src/app/modules/login/store/login.selectors';
import { AppState } from 'src/app/store/app.state';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  isLoading$!: Observable<boolean>;
  userRestaurants$!: Observable<Restaurant[] | null>;

  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  constructor(
    private router: Router,
    private store: Store<AppState>,
  ) { }

  ngOnInit(): void {
    this.isLoading$ = this.store.select(selectLoading);
    this.userRestaurants$ = this.store.select(selectUserRestaurants);
    this.userRestaurants$.pipe(
      filter(Boolean),
      takeUntil(this.destroyed$),
    ).subscribe((restaurants) => {
      if (restaurants) {
        this.router.navigate([restaurants[0].code, 'admin', 'menu']);
      }
    })
  }
}
