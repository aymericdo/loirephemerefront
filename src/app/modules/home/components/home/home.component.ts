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
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  pastries$: Observable<Pastry[]>;
  selectedPastries$: Observable<{ [pastryId: string]: number }>;
  hasSelectedPastries$: Observable<Boolean>;
  totalPrice$: Observable<number>;
  isOpenTableModal: boolean = false;
  currentTable: string = '';
  tables: string[] = [
    'Bulbizarre',
    'Salamèche',
    'Carapuce',
    'Coconfort',
    'Roucool',
    'Nidoqueen',
    'Mélofée',
    'Aéromite',
    'Arcanin',
    'Onix',
    'Amonita',
    'Kabuto',
    'Draco',
  ];

  constructor(
    private store: Store<AppState>,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.pastries$ = this.store.select(selectPastries);
    this.selectedPastries$ = this.store.select(selectSelectedPastries);
    this.totalPrice$ = this.store.select(selectTotalPrice);
    this.hasSelectedPastries$ = this.store.select(selectHasSelectedPastries);
  }

  ngOnInit(): void {
    this.store.dispatch(fetchPastries());

    this.route.queryParams.subscribe((params) => {
      this.currentTable = params['table'];
      if (!this.currentTable) {
        this.isOpenTableModal = true;
      }
    });
  }

  handleOkTableModal(): void {
    this.router.navigate(['/'], { queryParams: { table: this.currentTable } });
    this.isOpenTableModal = false;
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
