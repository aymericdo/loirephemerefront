import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/store/app.state';
import {
  incrementPastry,
  decrementPastry,
  fetchPastries,
  sendCommand,
  resetCommand,
} from 'src/app/modules/home/store/home.actions';
import { Observable } from 'rxjs';
import { Pastry } from 'src/app/interfaces/pastry.interface';
import {
  selectHasSelectedPastries,
  selectPastries,
  selectSelectedPastries,
  selectTotalPrice,
} from 'src/app/modules/home/store/home.selectors';

@Component({
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  pastries$: Observable<Pastry[]>;
  selectedPastries$: Observable<{ [pastryId: string]: number }>;
  hasSelectedPastries$: Observable<Boolean>;
  totalPrice$: Observable<number>;

  constructor(private store: Store<AppState>) {
    this.pastries$ = this.store.select(selectPastries);
    this.selectedPastries$ = this.store.select(selectSelectedPastries);
    this.totalPrice$ = this.store.select(selectTotalPrice);
    this.hasSelectedPastries$ = this.store.select(selectHasSelectedPastries);
  }

  ngOnInit(): void {
    this.store.dispatch(fetchPastries());
  }

  handleClickPlus(pastry: Pastry): void {
    this.store.dispatch(incrementPastry({ pastry }));
  }

  handleClickMinus(pastry: Pastry): void {
    this.store.dispatch(decrementPastry({ pastry }));
  }

  handleClickCommand(): void {
    this.store.dispatch(sendCommand());
  }

  handleClickReset(): void {
    this.store.dispatch(resetCommand());
  }
}
