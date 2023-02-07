import {
  Component,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChildren
} from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { SwPush } from '@angular/service-worker';
import { Store } from '@ngrx/store';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Observable, ReplaySubject } from 'rxjs';
import { filter, map, take, takeUntil, withLatestFrom } from 'rxjs/operators';
import { APP_NAME, VAPID_PUBLIC_KEY } from 'src/app/app.module';
import { Command, CoreCommand } from 'src/app/interfaces/command.interface';
import { Pastry } from 'src/app/interfaces/pastry.interface';
import { Restaurant } from 'src/app/interfaces/restaurant.interface';
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

  restaurant$: Observable<Restaurant | null>;
  pastries$: Observable<Pastry[]>;
  selectedPastries$: Observable<{ [pastryId: string]: number }>;
  hasSelectedPastries$: Observable<boolean>;
  totalPrice$: Observable<number>;
  totalCount$: Observable<number>;
  isLoading$: Observable<boolean>;
  isStockIssue$: Observable<boolean>;
  personalCommand$: Observable<Command | null>;
  errorCommand$: Observable<Object | null>;
  demoResto$: Observable<Restaurant | null>;

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
    private router: Router,
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
    this.route.paramMap.pipe(
      map((params: ParamMap) => params.get('code')),
      filter(Boolean),
      takeUntil(this.destroyed$),
    ).subscribe(code => {
      this.subscribeToWS(code);
      this.store.dispatch(fetchRestaurantPastries({ code }));
    });

    this.demoResto$.pipe(
      filter(Boolean),
      withLatestFrom(
        this.route.paramMap.pipe(
          map((params: ParamMap) => params.get('code')),
        ),
      ),
      takeUntil(this.destroyed$),
    ).subscribe(([demoResto, code]) => {
      if (!code) {
        const saveCode = localStorage.getItem('current_code');
        this.router.navigate(['/', saveCode || demoResto.code]);
      }
    });

    this.restaurant$.pipe(
      filter(Boolean),
      takeUntil(this.destroyed$),
    ).subscribe((restaurant) => {
      this.titleService.setTitle(restaurant.name);
      this.setIsRestaurantOpened(restaurant);
    });

    this.personalCommand$
      .pipe(filter(Boolean), takeUntil(this.destroyed$))
      .subscribe((command: Command | any) => {
        if (environment.production) {
          this.swPush
            .requestSubscription({
              serverPublicKey: VAPID_PUBLIC_KEY,
            })
            .then((sub) => {
              this.store.dispatch(
                sendNotificationSub({ commandId: command.id!, sub })
              );
            })
            .catch((err) =>
              console.error('Could not subscribe to notifications', err)
            );

          this.swPush.notificationClicks.subscribe((_event) => {
            this.router.navigate(['/']);
          });
        }

        this.wsService.sendMessage(
          JSON.stringify({
            event: 'addWaitingQueue',
            data: command,
          })
        );
      });
  }

  handleClickPlus(pastry: Pastry): void {
    let count: number = 0;
    this.selectedPastries$.pipe(take(1)).subscribe((selectedPastries: { [pastryId: string]: number }) => {
      count = selectedPastries[pastry.id] || 0;
    });

    if (count === 0) {
      const cardToScroll = this.itemElements.find(
        (item) => item.pastry.id === pastry.id
      );

      if (cardToScroll) {
        window.scroll({
          top:
            window.pageYOffset +
            cardToScroll.elem.nativeElement.getBoundingClientRect().top -
            50,
          behavior: 'smooth',
        });
      }
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

    // Hack for safari
    this.audio = new Audio('assets/sounds/french.mp3');
    this.audio.play();
    this.audio.pause();
    this.audio.currentTime = 0;
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
  }

  trackById(_index: any, pastry: Pastry): string {
    return pastry.id;
  }

  private setIsRestaurantOpened(restaurant: Restaurant): void {
    const today = new Date();
    const currentDay = today.getDay();
    const cwday = ((currentDay - 1 + 7) % 7);

    if (!!(restaurant.openingTime && restaurant.openingTime[cwday])) {
      const openingHoursMinutes = restaurant.openingTime[cwday].startTime.split(':');
      const startTime = new Date();
      startTime.setHours(+openingHoursMinutes[0], +openingHoursMinutes[1], 0, 0);

      const closingHoursMinutes = restaurant.openingTime[cwday].endTime.split(':');
      const endTime = new Date();
      endTime.setHours(+closingHoursMinutes[0], +closingHoursMinutes[1], 0, 0);

      this.isRestaurantOpened = startTime < today && today < endTime;

      let startOpeningPickupTime = startTime;
      if (restaurant.openingPickupTime) {
        const openingPickupHoursMinutes = restaurant.openingPickupTime[cwday].startTime.split(':');
        const startTime = new Date();
        startTime.setHours(+openingPickupHoursMinutes[0], +openingPickupHoursMinutes[1], 0, 0);

        startOpeningPickupTime = startTime;
      }

      this.pickUpTimeAvailable = !!(
        restaurant.openingPickupTime &&
        restaurant.openingPickupTime[cwday] &&
        today < endTime &&
        today >= startOpeningPickupTime
      );
    } else {
      this.isRestaurantOpened = false;
      this.pickUpTimeAvailable = false;
    }
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

            const canVibrate = window.navigator.vibrate;
            if (canVibrate!) window.navigator.vibrate([2000, 10, 2000]);

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
