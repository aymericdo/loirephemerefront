import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, ReplaySubject, filter, takeUntil } from 'rxjs';
import { Restaurant } from 'src/app/interfaces/restaurant.interface';
import { removeNotificationSub } from 'src/app/modules/admin/modules/commands/store/commands.actions';
import { selectRestaurant } from 'src/app/modules/login/store/login.selectors';

@Component({
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss'],
  imports: [
    RouterModule,
  ],
})
export class AdminComponent implements OnDestroy, OnInit {
  restaurant$: Observable<Restaurant | null>;

  restaurant: Restaurant | null = null;

  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  constructor(
    private store: Store,
  ) {
    this.restaurant$ = this.store.select(selectRestaurant);
  }

  ngOnInit(): void {
    this.restaurant$.pipe(
      filter(Boolean),
      takeUntil(this.destroyed$),
    ).subscribe((restaurant) => {
      this.restaurant = restaurant;
      this.store.dispatch(removeNotificationSub({ code: restaurant.code }));
    });
  }

  ngOnDestroy(): void {
    this.store.dispatch(removeNotificationSub({ code: this.restaurant!.code }));
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
