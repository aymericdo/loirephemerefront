import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, ReplaySubject } from 'rxjs';
import { Restaurant } from 'src/app/interfaces/restaurant.interface';
import { startLoading } from 'src/app/modules/admin/modules/commands/store/commands.actions';
import { selectIsLoading } from 'src/app/modules/admin/modules/commands/store/commands.selectors';


import { selectRestaurant } from 'src/app/modules/login/store/login.selectors';
import { AppState } from 'src/app/store/app.state';

@Component({
  templateUrl: './restaurant.component.html',
  styleUrls: ['./restaurant.component.scss'],
})
export class RestaurantComponent implements OnInit, OnDestroy {
  isLoading$: Observable<boolean>;
  restaurant$: Observable<Restaurant | null>;

  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  constructor(
    private store: Store<AppState>,
  ) {
    this.isLoading$ = this.store.select(selectIsLoading);
    this.restaurant$ = this.store.select(selectRestaurant);
  }

  ngOnInit(): void {
    this.store.dispatch(startLoading());
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
