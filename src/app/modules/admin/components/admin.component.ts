import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/store/app.state';
import { fetchRestaurant } from '../store/admin.actions';

@Component({
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss'],
})
export class AdminComponent implements OnInit {
  constructor(
    private store: Store<AppState>,
    private route: ActivatedRoute
  ) {
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      if (params.get('code')) {
        this.store.dispatch(fetchRestaurant({ code: params.get('code')! }));
      }
    })
  }
}
