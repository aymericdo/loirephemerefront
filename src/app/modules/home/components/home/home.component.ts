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
  setStock,
} from 'src/app/modules/home/store/home.actions';
import { Observable, ReplaySubject } from 'rxjs';
import { Pastry } from 'src/app/interfaces/pastry.interface';
import {
  selectErrorCommand,
  selectHasSelectedPastries,
  selectIsLoading,
  selectIsStockIssue,
  selectPastries,
  selectPersonalCommand,
  selectSelectedPastries,
  selectTable,
  selectTotalPrice,
} from 'src/app/modules/home/store/home.selectors';
import { ActivatedRoute, Router } from '@angular/router';
import { take, takeUntil } from 'rxjs/operators';
import { TABLES_POSSIBILITIES } from '../table-modal/table-modal.component';
import { NzModalService } from 'ng-zorro-antd/modal';
import { Command } from 'src/app/interfaces/command.interface';
import {
  WebSocketData,
  HomeWebSocketService,
} from 'src/app/modules/home/services/home-socket.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';

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
  isStockIssue$: Observable<boolean>;
  personalCommand$: Observable<Command | null>;
  errorCommand$: Observable<Object | null>;
  currentTable: string | null = null;
  isSuccessModalVisible = false;

  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  constructor(
    private store: Store<AppState>,
    private route: ActivatedRoute,
    private router: Router,
    private modal: NzModalService,
    private wsService: HomeWebSocketService,
    private notification: NzNotificationService
  ) {
    this.pastries$ = this.store.select(selectPastries);
    this.selectedPastries$ = this.store.select(selectSelectedPastries);
    this.totalPrice$ = this.store.select(selectTotalPrice);
    this.hasSelectedPastries$ = this.store.select(selectHasSelectedPastries);
    this.isLoading$ = this.store.select(selectIsLoading);
    this.isStockIssue$ = this.store.select(selectIsStockIssue);
    this.table$ = this.store.select(selectTable);
    this.personalCommand$ = this.store.select(selectPersonalCommand);
    this.errorCommand$ = this.store.select(selectErrorCommand);
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

    this.wsService
      .createObservableSocket()
      .pipe(takeUntil(this.destroyed$))
      .subscribe(
        (data: WebSocketData) => {
          if (data.hasOwnProperty('stockChanged')) {
            this.store.dispatch(
              setStock({
                pastryId: data.stockChanged.pastryId as string,
                newStock: data.stockChanged.newStock as number,
              })
            );
          } else if (data.hasOwnProperty('wizz')) {
            window.navigator.vibrate([2000, 10, 2000]);
            this.notification.create(
              'success',
              'Votre commande est prête !',
              '',
              {
                nzDuration: 0,
              }
            );
          }
        },
        (err) => console.log('err'),
        () => console.log('The observable stream is complete')
      );
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
    this.isSuccessModalVisible = true;
    this.store.dispatch(sendCommand({ table: this.currentTable!, name }));
  }

  handleClickReset(): void {
    this.store.dispatch(resetCommand());
  }

  closeSocket() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  ngOnDestroy() {
    this.closeSocket();
  }

  tackById(_index: any, pastry: Pastry): string {
    return pastry._id;
  }
}
