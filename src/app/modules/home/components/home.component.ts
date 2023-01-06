import {
  Component,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/store/app.state';
import {
  decrementPastry,
  fetchingRestaurant,
  incrementPastry,
  resetCommand,
  sendCommand,
  sendNotificationSub,
  setStock,
  startLoading,
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
  selectRestaurant,
  selectSelectedPastries,
  selectTotalPrice,
} from 'src/app/modules/home/store/home.selectors';
import { ActivatedRoute, Router } from '@angular/router';
import { filter, take, takeUntil } from 'rxjs/operators';
import { Command, CoreCommand } from 'src/app/interfaces/command.interface';
import {
  HomeWebSocketService,
  WebSocketData,
} from 'src/app/modules/home/services/home-socket.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { environment } from 'src/environments/environment';
import { SwPush } from '@angular/service-worker';
import { Restaurant } from 'src/app/interfaces/restaurant.interface';
import { Title } from '@angular/platform-browser';
import { APP_NAME, VAPID_PUBLIC_KEY } from 'src/app/app.module';

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
  isLoading$: Observable<boolean>;
  isStockIssue$: Observable<boolean>;
  personalCommand$: Observable<Command | null>;
  errorCommand$: Observable<Object | null>;
  isSuccessModalVisible = false;
  isWizzNotificationVisible = false;

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
    this.hasSelectedPastries$ = this.store.select(selectHasSelectedPastries);
    this.isLoading$ = this.store.select(selectIsLoading);
    this.isStockIssue$ = this.store.select(selectIsStockIssue);
    this.personalCommand$ = this.store.select(selectPersonalCommand);
    this.errorCommand$ = this.store.select(selectErrorCommand);
  }

  ngOnInit(): void {
    this.store.dispatch(startLoading());

    this.route.paramMap.pipe(
      takeUntil(this.destroyed$)
    ).subscribe(params => {
      this.store.dispatch(fetchingRestaurant({ code: params.get('code')! }));
      this.subscribeToWS(params.get('code')!);
    });

    this.restaurant$.pipe(
      filter(Boolean),
      takeUntil(this.destroyed$),
    ).subscribe((restaurant) => {
      this.titleService.setTitle(restaurant.name);
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

  ngOnDestroy() {
    this.titleService.setTitle(APP_NAME);
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  trackById(_index: any, pastry: Pastry): string {
    return pastry.id;
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
            if (!this.isWizzNotificationVisible) {
              this.isWizzNotificationVisible = true;
              this.notification
                .create('success', 'Votre commande est prête !', '', {
                  nzDuration: 0,
                })
                .onClose.subscribe(() => {
                  this.isWizzNotificationVisible = false;
                });
            }

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
