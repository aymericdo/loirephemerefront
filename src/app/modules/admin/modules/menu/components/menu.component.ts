import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, ReplaySubject, filter, map, takeUntil } from 'rxjs';
import { CorePastry, Pastry } from 'src/app/interfaces/pastry.interface';
import { Restaurant } from 'src/app/interfaces/restaurant.interface';
import { activatingPastry, closeMenuModal, deactivatingPastry, decrementPastry, fetchingAllRestaurantPastries, incrementPastry, openMenuModal, setStock, startLoading } from 'src/app/modules/admin/modules/menu/store/menu.actions';
import { selectAllPastries, selectEditingPastry, selectIsLoading, selectIsMovingPastry, selectMenuModalOpened } from 'src/app/modules/admin/modules/menu/store/menu.selectors';
import { MenuWebSocketService, WebSocketData } from 'src/app/modules/admin/services/menu-socket.service';
import { selectRestaurant } from 'src/app/modules/login/store/login.selectors';
import { AppState } from 'src/app/store/app.state';

@Component({
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
  providers: [MenuWebSocketService],
})
export class MenuComponent implements OnInit, OnDestroy {
  restaurant$: Observable<Restaurant | null>;
  pastries$: Observable<Pastry[]>;
  isLoading$: Observable<boolean>;
  isMoving$: Observable<boolean>;
  menuModalOpened$: Observable<'new' | 'edit' | null>;
  selectEditingPastry$: Observable<Pastry | null>;

  isInSequenceMode: boolean = false;
  isInAssociationMode: boolean = false;

  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  constructor(
    private store: Store<AppState>,
    private route: ActivatedRoute,
    private wsService: MenuWebSocketService,
  ) {
    this.restaurant$ = this.store.select(selectRestaurant);
    this.pastries$ = this.store.select(selectAllPastries);
    this.isLoading$ = this.store.select(selectIsLoading);
    this.isMoving$ = this.store.select(selectIsMovingPastry);
    this.menuModalOpened$ = this.store.select(selectMenuModalOpened);
    this.selectEditingPastry$ = this.store.select(selectEditingPastry);
  }

  ngOnInit(): void {
    this.store.dispatch(startLoading());

    this.route.paramMap.pipe(
      map((params: ParamMap) => params.get('code')),
      filter(Boolean),
      takeUntil(this.destroyed$)
    ).subscribe(code => {
      this.subscribeToWS(code);
      this.store.dispatch(fetchingAllRestaurantPastries({ code }));
    });
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  openNewPastryModal(): void {
    this.store.dispatch(openMenuModal({ modal: 'new' }));
  }

  openEditPastryModal(pastry: Pastry): void {
    this.store.dispatch(openMenuModal({ modal: 'edit', pastry }));
  }

  handleActivePastry(pastry: Pastry): void {
    const currentPastry = this.getCorePastry(pastry);
    this.store.dispatch(activatingPastry({ pastry: {
      ...currentPastry,
      hidden: false,
    }}));
  }

  handleDeletePastry(pastry: Pastry): void {
    const currentPastry = this.getCorePastry(pastry);
    this.store.dispatch(deactivatingPastry({ pastry: {
      ...currentPastry,
      hidden: true,
    }}));
  }

  closeMenuModal(): void {
    this.store.dispatch(closeMenuModal());
  }

  handleClickPlus(pastry: Pastry): void {
    const currentPastry = this.getCorePastry(pastry);
    this.store.dispatch(incrementPastry({ pastry: {
      ...currentPastry,
      stock: (currentPastry.stock + 1 >= 0) ? currentPastry.stock + 1 : 0,
    }}));
  }

  handleClickMinus(pastry: Pastry): void {
    const currentPastry = this.getCorePastry(pastry);
    this.store.dispatch(decrementPastry({ pastry: {
      ...currentPastry,
      stock: (currentPastry.stock - 1 >= 0) ? currentPastry.stock - 1 : 0,
    }}));
  }

  trackById(_index: any, pastry: Pastry): string {
    return pastry.id;
  }

  private getCorePastry(pastry: Pastry): CorePastry {
    const currentPastry = { ...pastry };
    delete currentPastry.restaurant;
    return currentPastry;
  }

  private subscribeToWS(code: string) {
    setInterval(() => {
      this.wsService.sendMessage('ping');
    }, 5000);

    this.wsService
      .createObservableSocket(code)
      .pipe(takeUntil(this.destroyed$))
      .subscribe({
        next: (data: WebSocketData) => {
          if (data.hasOwnProperty('stockChanged')) {
            const stockChanged: { pastryId: string; newStock: number, commandId: string } =
              data.stockChanged as { pastryId: string; newStock: number, commandId: string };

            this.store.dispatch(
              setStock({
                pastryId: stockChanged.pastryId as string,
                newStock: stockChanged.newStock as number,
              })
            );
          }
        },
        error: (err) => {
          console.error(err);
        },
        complete: () => {
          if (!this.destroyed$.observed) {
            setTimeout(() => {
              this.subscribeToWS(code);
            }, 1000);
          }
          console.log('The observable stream is complete');
        }
     });
  }
}
