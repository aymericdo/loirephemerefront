import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, ReplaySubject, timer } from 'rxjs';
import { filter, map, switchMap, takeUntil, withLatestFrom } from 'rxjs/operators';
import { Restaurant } from 'src/app/classes/restaurant';
import { Command, CoreCommand } from 'src/app/interfaces/command.interface';
import { Pastry } from 'src/app/interfaces/pastry.interface';
import { Restaurant as RestaurantInterface } from 'src/app/interfaces/restaurant.interface';
import { HomeNotificationsComponent } from 'src/app/modules/home/components/home-notifications/home-notifications.component';
import { OrderFooterComponent } from 'src/app/modules/home/components/order-footer/order-footer.component';
import { OrderModalComponent } from 'src/app/modules/home/components/order-modal/order-modal.component';
import { OrderNameModalComponent } from 'src/app/modules/home/components/order-name-modal/order-name-modal.component';
import {
  HomeWebSocketService,
} from 'src/app/modules/home/services/home-socket.service';
import {
  decrementPastry,
  fetchRestaurantPastries,
  incrementPastry,
  markPersonalCommandAsPayed,
  resetCommand,
  sendingCommand,
} from 'src/app/modules/home/store/home.actions';
import {
  selectHasSelectedPastries,
  selectIsLoading,
  selectIsStockIssue,
  selectPastries,
  selectPersonalCommand,
  selectSelectedPastries,
  selectSelectedPastriesTotalCount,
  selectTotalPrice,
} from 'src/app/modules/home/store/home.selectors';
import { selectDemoResto, selectRestaurant } from 'src/app/auth/store/auth.selectors';
import { FooterComponent } from 'src/app/shared/components/footer/footer.component';
import { InformationPopoverComponent } from 'src/app/shared/components/information-popover/information-popover.component';
import { PastryCardComponent } from 'src/app/shared/components/pastry-card/pastry-card.component';
import { NgZorroModule } from 'src/app/shared/ngzorro.module';
import { APP_NAME } from 'src/main';

@Component({
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  providers: [HomeWebSocketService],
  imports: [
    CommonModule,
    NgZorroModule,
    FormsModule,
    HomeNotificationsComponent,
    PastryCardComponent,
    InformationPopoverComponent,
    OrderNameModalComponent,
    OrderFooterComponent,
    OrderModalComponent,
    FooterComponent,
  ],
})
export class HomeComponent implements OnInit, OnDestroy {
  @ViewChildren('item') itemElements!: QueryList<any>;

  restaurant$: Observable<RestaurantInterface | null>;
  pastries$: Observable<Pastry[]>;
  selectedPastries$: Observable<{ [pastryId: string]: number }>;
  hasSelectedPastries$: Observable<boolean>;
  totalPrice$: Observable<number>;
  totalCount$: Observable<number>;
  isLoading$: Observable<boolean>;
  isStockIssue$: Observable<boolean>;
  personalCommand$: Observable<Command | null>;
  demoResto$: Observable<RestaurantInterface | null>;

  orderModalOpened: 'order-summary' | 'order-name' | null = null;

  hasScrolled: boolean = false;
  paymentRequired: boolean = false;
  isRestaurantOpened: boolean = false;
  pickUpTimeAvailable: boolean = false;

  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  constructor(
    private store: Store,
    private route: ActivatedRoute,
    private titleService: Title,
    private changeDetectorRef: ChangeDetectorRef,
  ) {
    this.restaurant$ = this.store.select(selectRestaurant);
    this.pastries$ = this.store.select(selectPastries);
    this.selectedPastries$ = this.store.select(selectSelectedPastries);
    this.totalPrice$ = this.store.select(selectTotalPrice);
    this.totalCount$ = this.store.select(selectSelectedPastriesTotalCount);
    this.hasSelectedPastries$ = this.store.select(selectHasSelectedPastries);
    this.isLoading$ = this.store.select(selectIsLoading);
    this.isStockIssue$ = this.store.select(selectIsStockIssue);
    this.personalCommand$ = this.store.select(selectPersonalCommand);
    this.demoResto$ = this.store.select(selectDemoResto);
  }

  ngOnInit(): void {
    this.store.dispatch(resetCommand());

    this.route.paramMap.pipe(
      map((params: ParamMap) => params.get('code')),
      filter(Boolean),
      takeUntil(this.destroyed$),
    ).subscribe(code => {
      this.store.dispatch(fetchRestaurantPastries({ code }));
    });

    this.restaurant$.pipe(
      filter(Boolean),
      switchMap(() => this.route.queryParamMap),
      map((params: ParamMap) => (params.has('sessionCommandId') && params.has('sessionId')) ?
        { sessionCommandId: params.get('sessionCommandId')!, sessionId: params.get('sessionId')! } :
        null,
      ),
      filter(Boolean),
      takeUntil(this.destroyed$),
    ).subscribe(({ sessionCommandId, sessionId }: { sessionCommandId: string, sessionId: string }) => {
      this.store.dispatch(markPersonalCommandAsPayed({ commandId: sessionCommandId, sessionId }));
    });

    this.restaurant$.pipe(
      filter(Boolean),
      takeUntil(this.destroyed$),
    ).subscribe((restaurant: RestaurantInterface) => {
      this.paymentRequired = !!(restaurant.paymentInformation?.paymentActivated &&
        restaurant.paymentInformation?.paymentRequired);
      this.titleService.setTitle(restaurant.name);
      this.setIsRestaurantOpened(restaurant);
    });

    this.watchIsOpened();
  }

  handleClickPlus(pastry: Pastry): void {
    this.store.dispatch(incrementPastry({ pastry }));
  }

  handleClickMinus(pastry: Pastry): void {
    this.store.dispatch(decrementPastry({ pastry }));
  }

  handleCommandClicked({ name, takeAway, pickUpTime }: CoreCommand): void {
    this.orderModalOpened = null;
    this.store.dispatch(sendingCommand({ command: { name, takeAway, pickUpTime } }));
  }

  handleClickReset(): void {
    this.store.dispatch(resetCommand());
  }

  ngOnDestroy() {
    this.titleService.setTitle(APP_NAME);
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  onChange(status: boolean): void {
    this.hasScrolled = status;
    this.changeDetectorRef.detectChanges();
  }

  trackById(_index: any, pastry: Pastry): string {
    return pastry.id;
  }

  private watchIsOpened(): void {
    const source = timer(1000, 1000);
    source.pipe(
      withLatestFrom(this.restaurant$.pipe(filter(Boolean))),
      takeUntil(this.destroyed$))
      .subscribe(([_i, restaurant]) => {
        this.setIsRestaurantOpened(restaurant);
      });
  }

  private setIsRestaurantOpened(restaurant: RestaurantInterface): void {
    const resto = new Restaurant(restaurant);
    this.isRestaurantOpened = resto.isOpen();
    this.pickUpTimeAvailable = resto.isPickupOpen();
  }
}
