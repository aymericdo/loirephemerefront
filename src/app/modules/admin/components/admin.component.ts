import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { fetchingRestaurant } from 'src/app/modules/admin/store/admin.actions';
import { selectIsSiderCollapsed } from 'src/app/modules/home/store/home.selectors';
import { AppState } from 'src/app/store/app.state';

@Component({
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss'],
})
export class AdminComponent implements OnInit {
  isSiderCollapsed$: Observable<boolean>;

  constructor(
    private store: Store<AppState>,
    private route: ActivatedRoute
  ) {
    this.isSiderCollapsed$ = this.store.select(selectIsSiderCollapsed);
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      if (params.get('code')) {
        this.store.dispatch(fetchingRestaurant({ code: params.get('code')! }));
      }
    });
  }
}
