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
import { TABLES_POSSIBILITIES } from '../table-modal/table-modal.component';
import { NzModalService } from 'ng-zorro-antd/modal';

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
  currentTable: string | null = null;

  constructor(
    private store: Store<AppState>,
    private route: ActivatedRoute,
    private router: Router,
    private modal: NzModalService
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

    this.route.paramMap.subscribe((paramMap) => {
      this.currentTable = paramMap.get('tableName');
      if (
        this.currentTable &&
        TABLES_POSSIBILITIES.includes(this.currentTable)
      ) {
        this.store.dispatch(setTable({ table: this.currentTable }));
      } else {
        this.table$.pipe(take(1)).subscribe((table) => {
          if (table) {
            this.router.navigate(['/table', table]);
          } else {
            this.router.navigate(['/']);
          }
        });
      }
    });
  }

  handleTableChange(): void {
    this.modal.confirm({
      nzTitle: 'Changer de table ?',
      nzOkText: 'OK',
      nzOkType: 'primary',
      nzOnOk: () => {
        this.router.navigate(['/']);
      },
      nzCancelText: 'Annuler',
    });
  }

  handleClickPlus(pastry: Pastry): void {
    this.store.dispatch(incrementPastry({ pastry }));
  }

  handleClickMinus(pastry: Pastry): void {
    this.store.dispatch(decrementPastry({ pastry }));
  }

  handleClickCommand(name: string): void {
    this.store.dispatch(sendCommand({ table: this.currentTable!, name }));
  }

  handleClickReset(): void {
    this.store.dispatch(resetCommand());
  }
}
