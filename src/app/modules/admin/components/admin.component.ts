import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, ReplaySubject, takeUntil } from 'rxjs';
import { fetchingRestaurant } from 'src/app/modules/admin/store/admin.actions';
import { selectIsSiderCollapsed } from 'src/app/modules/home/store/home.selectors';
import { AppState } from 'src/app/store/app.state';

@Component({
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss'],
})
export class AdminComponent implements OnInit, OnDestroy {
  isSiderCollapsed$: Observable<boolean>;

  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  constructor(
    private store: Store<AppState>,
    private route: ActivatedRoute
  ) {
    this.isSiderCollapsed$ = this.store.select(selectIsSiderCollapsed);
  }

  ngOnInit(): void {
    this.route.paramMap.pipe(
      takeUntil(this.destroyed$)
    ).subscribe((params) => {
      if (params.get('code')) {
        this.store.dispatch(fetchingRestaurant({ code: params.get('code')! }));
      }
    });
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
