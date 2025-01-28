import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { NzNotificationComponent, NzNotificationService } from 'ng-zorro-antd/notification';
import { Observable, ReplaySubject, combineLatest, filter, map, switchMap, take, takeUntil } from 'rxjs';
import { Command } from 'src/app/interfaces/command.interface';
import { HomeWebSocketService, WebSocketData } from 'src/app/modules/home/services/home-socket.service';
import { cancelPersonalCommand, fetchingPersonalCommand, resetErrorCommand, sendNotificationSub, setStock } from 'src/app/modules/home/store/home.actions';
import { selectCurrentSentCommandFromCommandList, selectErrorCommand, selectPersonalCommand } from 'src/app/modules/home/store/home.selectors';
import { AppState } from 'src/app/store/app.state';
import { canVibrate } from 'src/app/helpers/vibrate';
import { SwPush } from '@angular/service-worker';
import { selectRestaurant } from 'src/app/modules/login/store/login.selectors';
import { Restaurant as RestaurantInterface } from 'src/app/interfaces/restaurant.interface';
import { VAPID_PUBLIC_KEY } from 'src/app/app.module';

@Component({
  selector: 'app-home-notifications',
  templateUrl: './home-notifications.component.html',
})
export class HomeNotificationsComponent implements OnInit, OnDestroy {
  @ViewChild('notificationPayedBtnTpl', { static: true }) notificationPayedBtnTemplate!: TemplateRef<{ $implicit: NzNotificationComponent }>;

  personalCommand$: Observable<Command | null>;
  restaurant$: Observable<RestaurantInterface | null>;
  errorCommand$: Observable<Object | null>;

  isSuccessModalVisible = false;
  isPaymentModalVisible = false;
  isPaymentModalBackBtn = false;

  private personalCommand: Command | null = null;
  private commandNotificationIdByCommandId: { [commandId: string]: string } = {};
  private audio!: HTMLAudioElement;
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  constructor(
    private store: Store<AppState>,
    private router: Router,
    private route: ActivatedRoute,
    private notification: NzNotificationService,
    private swPush: SwPush,
    private wsService: HomeWebSocketService,
  ) {
    this.restaurant$ = this.store.select(selectRestaurant);
    this.personalCommand$ = this.store.select(selectPersonalCommand);
    this.errorCommand$ = this.store.select(selectErrorCommand);
  }

  ngOnInit(): void {
    this.route.paramMap.pipe(
      map((params: ParamMap) => params.get('code')),
      filter(Boolean),
      takeUntil(this.destroyed$),
    ).subscribe(code => {
      this.subscribeToWS(code);
    });

    this.restaurant$.pipe(
      filter(Boolean),
      switchMap(() => this.route.queryParamMap),
      map((params: ParamMap) => params.get('commandId')),
      filter(Boolean),
      takeUntil(this.destroyed$),
    ).subscribe((commandId) => {
      this.store.dispatch(fetchingPersonalCommand({ commandId }));
      this.openSentCommandNotification(commandId);
    });

    combineLatest([
      this.route.queryParamMap.pipe(
        map((params: ParamMap) => params.get('payedCommandId')),
        filter(Boolean),
      ),
      this.personalCommand$.pipe(filter(Boolean)),
      this.restaurant$.pipe(filter(Boolean)),
    ])
    .pipe(
      map((data) => ({ commandId: data[0], personalCommand: data[1] })),
      takeUntil(this.destroyed$),
    ).subscribe(({ commandId, personalCommand }) => {
      if (commandId === personalCommand.id) {
        this.router.navigate(['.'], { relativeTo: this.route });

        if (personalCommand.paymentRequired) {
          this.isSuccessModalVisible = true;
        } else {
          this.openWaitingConfirmationNotification();
        }
      }
    });

    this.personalCommand$
      .pipe(
        filter(Boolean),
        take(1),
      )
      .subscribe((command: Command) => {
        if (command.paymentRequired && !command.isPayed) {
          this.isPaymentModalVisible = true;
        } else if (!command.isPayed) {
          this.isSuccessModalVisible = true;
        }
      });

    this.personalCommand$
      .pipe(filter(Boolean), takeUntil(this.destroyed$))
      .subscribe(async (command: Command | any) => {
        this.personalCommand = command;

        if (this.swPush.isEnabled) {
          try {
            const sub = await this.swPush.requestSubscription({
              serverPublicKey: VAPID_PUBLIC_KEY,
            });

            this.store.dispatch(
              sendNotificationSub({ commandId: command.id!, sub })
            );
            console.log('Subscription to notifications ok');
          } catch (err) {
            console.error('Could not subscribe to notifications', err);
          }
        }

        this.wsService.sendMessage(
          JSON.stringify({
            event: 'addWaitingQueue',
            data: command.id,
          })
        );
      });

    // if (this.swPush.isEnabled) {
    //   this.swPush.notificationClicks
    //     .pipe(takeUntil(this.destroyed$))
    //     .subscribe((event) => {
    //       console.log("event", event);
    //     });

    //   this.swPush.messages
    //     .pipe(takeUntil(this.destroyed$))
    //     .subscribe((message) => {
    //       console.log("message:", message);
    //     });
    // }
  }

  handlePayment(enableBackBtn = false): void {
    this.isSuccessModalVisible = false;
    this.isPaymentModalVisible = true;
    this.isPaymentModalBackBtn = enableBackBtn;
    this.notification.remove(this.commandNotificationIdByCommandId[this.personalCommand!.id]);
  }

  handlePaymentBack(): void {
    this.isSuccessModalVisible = true;
    this.isPaymentModalVisible = false;
  }

  handlePaymentClose(): void {
    this.isPaymentModalVisible = false;
    this.openWaitingConfirmationNotification();
  }

  handleCommandCancelled(origin: 'human' | 'time'): void {
    this.isPaymentModalVisible = false;

    if (origin === 'human') {
      this.store.dispatch(cancelPersonalCommand({
        commandId: this.personalCommand!.id,
      }));
    }
  }

  handleCloseErrorModal(): void {
    this.router.navigate(['.'], { relativeTo: this.route });
    this.isSuccessModalVisible = false;
    this.store.dispatch(resetErrorCommand());
  }

  handleCloseSuccessModal(): void {
    this.isSuccessModalVisible = false;
    this.openWaitingConfirmationNotification();
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  private openWaitingConfirmationNotification(): void {
    this.commandNotificationIdByCommandId[this.personalCommand!.id] = this.notification
      .create(
        'success',
        $localize`Votre commande ${this.personalCommand!.reference} a bien été envoyée !`,
        $localize`Pour être averti que votre commande est prête, ne rafraichissez pas cette page. Une notification vous préviendra.`, {
          nzDuration: 0,
          nzKey: this.personalCommand!.id,
          nzButton: this.notificationPayedBtnTemplate,
        }
      ).messageId;
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

            this.openSentCommandNotification(commandId);
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

  private openSentCommandNotification(commandId: string): void {
    this.store.select(selectCurrentSentCommandFromCommandList({ commandId }))
      .pipe(filter(Boolean), take(1))
      .subscribe((command: Command) => {
        this.notification
          .create(
            'info',
            $localize`Votre commande ${command.reference} est prête !`,
            $localize`Bonne dégustation ! 🥰`, {
              nzDuration: 0,
              nzKey: commandId,
            }
          );

          if (canVibrate()) window.navigator.vibrate([2000, 10, 2000]);

          this.audio = new Audio('assets/sounds/french.mp3');
          this.audio.pause();
          this.audio.currentTime = 0;
          this.audio.play();
        });

    if (this.swPush.isEnabled) {
      try {
        this.swPush.unsubscribe();
      } catch (error) {
        console.log('Impossible to unsubscribe', error);
      }
    }
  }

}
