import {
  Component,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChildren
} from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { SwPush } from '@angular/service-worker';
import { Store } from '@ngrx/store';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Observable, ReplaySubject, timer } from 'rxjs';
import { filter, map, take, takeUntil, withLatestFrom } from 'rxjs/operators';
import { APP_NAME, VAPID_PUBLIC_KEY } from 'src/app/app.module';
import { Restaurant } from 'src/app/classes/restaurant';
import { canVibrate } from 'src/app/helpers/vibrate';
import { Command, CoreCommand } from 'src/app/interfaces/command.interface';
import { Pastry } from 'src/app/interfaces/pastry.interface';
import { Restaurant as RestaurantInterface } from 'src/app/interfaces/restaurant.interface';
import {
  HomeWebSocketService,
  WebSocketData
} from 'src/app/modules/home/services/home-socket.service';
import {
  decrementPastry,
  fetchRestaurantPastries,
  incrementPastry,
  resetCommand,
  sendCommand,
  sendNotificationSub,
  setStock
} from 'src/app/modules/home/store/home.actions';
import {
  selectCurrentSentCommandFromCommandList,
  selectErrorCommand,
  selectHasSelectedPastries,
  selectIsLoading,
  selectIsStockIssue,
  selectPastries,
  selectPersonalCommand,
  selectSelectedPastries,
  selectSelectedPastriesTotalCount,
  selectTotalPrice
} from 'src/app/modules/home/store/home.selectors';
import { selectDemoResto, selectRestaurant } from 'src/app/modules/login/store/login.selectors';
import { AppState } from 'src/app/store/app.state';
import { environment } from 'src/environments/environment';

@Component({
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  providers: [HomeWebSocketService],
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
  errorCommand$: Observable<Object | null>;
  demoResto$: Observable<RestaurantInterface | null>;

  isSuccessModalVisible = false;
  isOrderModalVisible: boolean = false;
  isUltimateConfirmationVisible: boolean = false;

  isRestaurantOpened: boolean = false;
  pickUpTimeAvailable: boolean = false;

  private commandNotificationIdByCommandId: { [commandId: string]: string } = {};
  private audio!: HTMLAudioElement;

  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  constructor(
    private store: Store<AppState>,
    private route: ActivatedRoute,
    private wsService: HomeWebSocketService,
    private notification: NzNotificationService,
    private swPush: SwPush,
    private titleService: Title,
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
    this.errorCommand$ = this.store.select(selectErrorCommand);
    this.demoResto$ = this.store.select(selectDemoResto);
  }

  ngOnInit(): void {
    this.store.dispatch(resetCommand());

    this.route.paramMap.pipe(
      map((params: ParamMap) => params.get('code')),
      filter(Boolean),
      takeUntil(this.destroyed$),
    ).subscribe(code => {
      this.subscribeToWS(code);
      this.store.dispatch(fetchRestaurantPastries({ code }));
    });

    this.restaurant$.pipe(
      filter(Boolean),
      takeUntil(this.destroyed$),
    ).subscribe((restaurant: RestaurantInterface) => {
      this.titleService.setTitle(restaurant.name);
      this.setIsRestaurantOpened(restaurant);
    });

    if (this.swPush.isEnabled) {
      console.log(this.swPush);
      this.swPush.notificationClicks
        .pipe(takeUntil(this.destroyed$))
        .subscribe((event) => {
          console.log("event", event);
        });

      this.swPush.messages
        .pipe(takeUntil(this.destroyed$))
        .subscribe((message) => {
          console.log("message:", message);
        });
    }

    this.personalCommand$
      .pipe(filter(Boolean), takeUntil(this.destroyed$))
      .subscribe((command: Command | any) => {
        if (this.swPush.isEnabled) {
          this.swPush
            .requestSubscription({
              serverPublicKey: VAPID_PUBLIC_KEY,
            })
            .then((sub) => {
              this.store.dispatch(
                sendNotificationSub({ commandId: command.id!, sub })
              );
              console.log('Subscription to notifications ok');
            })
            .catch((err) =>
              console.error('Could not subscribe to notifications', err)
            );
        }

        this.wsService.sendMessage(
          JSON.stringify({
            event: 'addWaitingQueue',
            data: command,
          })
        );
      });

    this.watchIsOpened();
  }

  handleClickPlus(pastry: Pastry): void {
    let count: number = 0;
    this.selectedPastries$.pipe(take(1)).subscribe((selectedPastries: { [pastryId: string]: number }) => {
      count = selectedPastries[pastry.id] || 0;
    });

    if (count === 0) {
      // const cardToScroll = this.itemElements.find(
      //   (item) => item.pastry.id === pastry.id
      // );

      // if (cardToScroll) {
      //   window.scroll({
      //     top:
      //       window.pageYOffset +
      //       cardToScroll.elem.nativeElement.getBoundingClientRect().top -
      //       10,
      //     behavior: 'smooth',
      //   });
      // }
    }
    this.store.dispatch(incrementPastry({ pastry }));
  }

  handleClickMinus(pastry: Pastry): void {
    this.store.dispatch(decrementPastry({ pastry }));
  }

  handleClickCommand({ name, takeAway, pickUpTime }: CoreCommand): void {
    this.isUltimateConfirmationVisible = false;
    this.isSuccessModalVisible = true;
    this.store.dispatch(sendCommand({ name, takeAway, pickUpTime }));
  }

  handleClickReset(): void {
    this.store.dispatch(resetCommand());
  }

  handleCloseSuccessModal(): void {
    this.isSuccessModalVisible = false;

    this.personalCommand$.pipe(filter(Boolean), take(1))
      .subscribe((command: Command) => {
        this.commandNotificationIdByCommandId[command.id] = this.notification
          .create(
            'success',
            `Votre commande ${command.reference} a bien été envoyée !`,
            "Pour être averti que votre commande est prête, ne rafraichissez pas cette page. Une notification vous préviendra.", {
              nzDuration: 0,
              nzKey: command.id,
            }
          ).messageId;
    });
  }

  ngOnDestroy() {
    this.titleService.setTitle(APP_NAME);
    this.destroyed$.next(true);
    this.destroyed$.complete();
    if (this.swPush.isEnabled) this.swPush.unsubscribe();
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
            this.store.dispatch(
              setStock({
                pastryId: data.stockChanged.pastryId as string,
                newStock: data.stockChanged.newStock as number,
              })
            );
          } else if (data.hasOwnProperty('wizz')) {
            const commandId = data.wizz.commandId;

            this.notification.remove(this.commandNotificationIdByCommandId[commandId]);

            this.store.select(selectCurrentSentCommandFromCommandList({ commandId }))
              .pipe(filter(Boolean), take(1))
              .subscribe((command: Command) => {
                this.notification
                  .create(
                    'info',
                    `Votre commande ${command.reference} est prête !`,
                    'Bonne dégustation ! 🥰', {
                      nzDuration: 0,
                      nzKey: commandId,
                    }
                  );
                });

            if (canVibrate()) window.navigator.vibrate([2000, 10, 2000]);

            this.audio = new Audio('assets/sounds/french.mp3');
            this.audio.pause();
            this.audio.currentTime = 0;
            this.audio.play();
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
