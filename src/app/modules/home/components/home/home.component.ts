import {
  Component,
  ElementRef,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/store/app.state';
import {
  incrementPastry,
  decrementPastry,
  fetchPastries,
  sendCommand,
  resetCommand,
  setStock,
  sendNotificationSub,
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
  selectTotalPrice,
} from 'src/app/modules/home/store/home.selectors';
import { ActivatedRoute, Router } from '@angular/router';
import { filter, takeUntil } from 'rxjs/operators';
import { NzModalService } from 'ng-zorro-antd/modal';
import { Command, CoreCommand } from 'src/app/interfaces/command.interface';
import {
  WebSocketData,
  HomeWebSocketService,
} from 'src/app/modules/home/services/home-socket.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { environment } from 'src/environments/environment';
import { SwPush } from '@angular/service-worker';

@Component({
  templateUrl: './home.component.html',
  providers: [HomeWebSocketService],
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  @ViewChild('scrollframe', { static: false }) scrollFrame!: ElementRef;
  @ViewChildren('item') itemElements!: QueryList<any>;

  pastries$: Observable<Pastry[]>;
  selectedPastries$: Observable<{ [pastryId: string]: number }>;
  hasSelectedPastries$: Observable<Boolean>;
  totalPrice$: Observable<number>;
  isLoading$: Observable<boolean>;
  isStockIssue$: Observable<boolean>;
  personalCommand$: Observable<Command | null>;
  errorCommand$: Observable<Object | null>;
  isSuccessModalVisible = false;
  isWizzNotificationVisible = false;

  private audio!: HTMLAudioElement;

  readonly VAPID_PUBLIC_KEY =
    'BKLI0usipFB5k2h5ZqMWF67Ln222rePzgMMWG-ctCgDN4DISjK_sK2PICWF3bjDFbhZTYfLS0Wc8qEqZ5paZvec';

  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  private scrollContainer: any;

  constructor(
    private store: Store<AppState>,
    private route: ActivatedRoute,
    private router: Router,
    private modal: NzModalService,
    private wsService: HomeWebSocketService,
    private notification: NzNotificationService,
    private swPush: SwPush
  ) {
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
    this.store.dispatch(fetchPastries());

    this.personalCommand$
      .pipe(filter(Boolean), takeUntil(this.destroyed$))
      .subscribe((command: Command | any) => {
        if (environment.production) {
          this.swPush
            .requestSubscription({
              serverPublicKey: this.VAPID_PUBLIC_KEY,
            })
            .then((sub) => {
              this.store.dispatch(
                sendNotificationSub({ commandId: command._id!, sub })
              );
            })
            .catch((err) =>
              console.error('Could not subscribe to notifications', err)
            );

          this.swPush.notificationClicks.subscribe((event) => {
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

    this.subscribeToWS();
  }

  ngAfterViewInit() {
    this.scrollContainer = this.scrollFrame.nativeElement;
  }

  handleClickPlus(pastry: Pastry, count: number): void {
    if (count === 0) {
      const cardToScroll = this.itemElements.find(
        (item) => item.pastry._id === pastry._id
      );

      if (cardToScroll) {
        this.scrollContainer.scroll({
          top:
            this.scrollContainer.scrollTop +
            cardToScroll.elem.nativeElement.getBoundingClientRect().top -
            50,
          left: 0,
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
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  tackById(_index: any, pastry: Pastry): string {
    return pastry._id;
  }

  private subscribeToWS() {
    setInterval(() => {
      this.wsService.sendMessage('ping');
    }, 5000);

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
        (err) => console.error(err),
        () => {
          setTimeout(() => {
            this.subscribeToWS();
          }, 1000);
          console.log('The observable stream is complete');
        }
      );
  }
}
