import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgZorroModule } from 'src/app/shared/ngzorro.module';
import { Store } from '@ngrx/store';
import { selectRestaurant } from 'src/app/auth/store/auth.selectors';
import { filter, Observable } from 'rxjs';
import { Restaurant } from 'src/app/interfaces/restaurant.interface';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { selectCommandsCount, selectIsLoading, selectPayedCommandsCount, selectUsersCount } from 'src/app/modules/admin/modules/dashboard/store/restaurant.selectors';
import { fetchingData } from 'src/app/modules/admin/modules/dashboard/store/dashboard.actions';

@Component({
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  imports: [
    NzProgressModule,
    NzStatisticModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    NgZorroModule,
  ],
})
export class DashboardComponent {
  restaurant$: Observable<Restaurant | null> = this.store.select(selectRestaurant);
  loading$: Observable<boolean> = this.store.select(selectIsLoading);
  usersCount$: Observable<number> = this.store.select(selectUsersCount);
  commandsCount$: Observable<number> = this.store.select(selectCommandsCount);
  payedCommandsCount$: Observable<number> = this.store.select(selectPayedCommandsCount);

  constructor(
    private store: Store,
  ) {}

  ngOnInit(): void {
    this.restaurant$.pipe(filter(Boolean)).subscribe(() => {
      this.store.dispatch(fetchingData());
    })
  }
}
