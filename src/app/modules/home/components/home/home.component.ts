import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/store/app.state';
import { fetchPastries } from 'src/app/modules/home/store/home.actions';
import { Observable } from 'rxjs';
import { Pastry } from 'src/app/interfaces/pastry.interface';
import { selectPastries } from 'src/app/modules/home/store/home.selectors';

@Component({
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  pastries$: Observable<Pastry[]>;

  constructor(private store: Store<AppState>) {
    this.pastries$ = this.store.select(selectPastries);
  }

  ngOnInit(): void {
    this.store.dispatch(fetchPastries());
  }
}
