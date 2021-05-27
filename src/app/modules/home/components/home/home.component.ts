import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/store/app.state';
import {
  incrementPastry,
  decrementPastry,
  fetchPastries,
  sendCommand,
  resetCommand,
  setTable,
} from 'src/app/modules/home/store/home.actions';
import { Observable } from 'rxjs';
import { Pastry } from 'src/app/interfaces/pastry.interface';
import {
  selectHasSelectedPastries,
  selectIsLoading,
  selectPastries,
  selectSelectedPastries,
  selectTable,
  selectTotalPrice,
} from 'src/app/modules/home/store/home.selectors';
import { ActivatedRoute, Router } from '@angular/router';
import { take } from 'rxjs/operators';

@Component({
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  pastries$: Observable<Pastry[]>;
  selectedPastries$: Observable<{ [pastryId: string]: number }>;
  hasSelectedPastries$: Observable<Boolean>;
  totalPrice$: Observable<number>;
  table$: Observable<string>;
  isLoading$: Observable<boolean>;
  isOpenTableModal: boolean = false;
  currentTable: string = '';

  constructor(
    private store: Store<AppState>,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.pastries$ = this.store.select(selectPastries);
    this.selectedPastries$ = this.store.select(selectSelectedPastries);
    this.totalPrice$ = this.store.select(selectTotalPrice);
    this.hasSelectedPastries$ = this.store.select(selectHasSelectedPastries);
    this.isLoading$ = this.store.select(selectIsLoading);
    this.table$ = this.store.select(selectTable);
  }

  ngOnInit(): void {
    this.store.dispatch(fetchPastries());

    this.route.queryParams.subscribe((params) => {
      this.currentTable = params['table'];
      if (!this.currentTable) {
        this.table$.pipe(take(1)).subscribe((table) => {
          if (table) {
            this.router.navigate(['/'], {
              queryParams: { table },
            });
          } else {
            this.isOpenTableModal = true;
          }
        });
      } else {
        this.store.dispatch(setTable({ table: this.currentTable }));
      }
    });
  }

  handleClickPlus(pastry: Pastry): void {
    this.store.dispatch(incrementPastry({ pastry }));
  }

  handleClickMinus(pastry: Pastry): void {
    this.store.dispatch(decrementPastry({ pastry }));
  }

  handleClickCommand(name: string): void {
    this.store.dispatch(sendCommand({ table: this.currentTable, name }));
  }

  handleClickReset(): void {
    this.store.dispatch(resetCommand());
  }
}
