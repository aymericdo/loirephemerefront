import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { NzNotificationComponent, NzNotificationService } from 'ng-zorro-antd/notification';
import { Observable, ReplaySubject, combineLatest, filter, map, switchMap, take, takeUntil } from 'rxjs';
import { Command } from 'src/app/interfaces/command.interface';
import { HomeWebSocketService, WebSocketData } from 'src/app/modules/home/services/home-socket.service';
import { cancelPersonalCommand, closeErrorModal, closeHomeModal, fetchingPersonalCommand, openHomeModal, sendNotificationSub, setStock } from 'src/app/modules/home/store/home.actions';
import { selectErrorCommand, selectHomeModal, selectPersonalCommand } from 'src/app/modules/home/store/home.selectors';
import { canVibrate } from 'src/app/helpers/vibrate';
import { SwPush } from '@angular/service-worker';
import { selectRestaurant } from 'src/app/auth/store/auth.selectors';
import { Restaurant as RestaurantInterface } from 'src/app/interfaces/restaurant.interface';
import { HomeModalType } from 'src/app/modules/home/store/home.reducer';
import { CommonModule } from '@angular/common';
import { NgZorroModule } from 'src/app/shared/ngzorro.module';
import { OrderSuccessModalComponent } from 'src/app/modules/home/components/order-success-modal/order-success-modal.component';
import { OrderPaymentModalComponent } from 'src/app/modules/home/components/order-payment-modal/order-payment-modal.component';
import { OrderErrorModalComponent } from 'src/app/modules/home/components/order-error-modal/order-error-modal.component';
import { OrderPaymentRequiredModalComponent } from 'src/app/modules/home/components/order-payment-required-modal/order-payment-required-modal.component';
import { VAPID_PUBLIC_KEY } from 'src/main';

@Component({
  selector: 'app-home-notifications',
  templateUrl: './home-notifications.component.html',
  imports: [
    CommonModule,
    NgZorroModule,
    OrderErrorModalComponent,
    OrderSuccessModalComponent,
    OrderPaymentModalComponent,
    OrderPaymentRequiredModalComponent,
  ],
})
export class HomeNotificationsComponent implements OnInit, OnDestroy {
  @ViewChild('notificationPayedBtnTpl', { static: true }) notificationPayedBtnTemplate!: TemplateRef<{ $implicit: NzNotificationComponent }>;

  personalCommand$: Observable<Command | null>;
  restaurant$: Observable<RestaurantInterface | null>;
  errorCommand$: Observable<Object | null>;
  homeModal$: Observable<HomeModalType | null>;

  isPaymentModalBackBtn = false;

  private personalCommand: Command | null = null;
  private commandNotificationIdByCommandId: { [commandId: string]: string } = {};
  private audio!: HTMLAudioElement;
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  constructor(
    private store: Store,
    private router: Router,
    private route: ActivatedRoute,
    private notification: NzNotificationService,
    private swPush: SwPush,
    private wsService: HomeWebSocketService,
  ) {
    this.restaurant$ = this.store.select(selectRestaurant);
    this.personalCommand$ = this.store.select(selectPersonalCommand);
    this.errorCommand$ = this.store.select(selectErrorCommand);
    this.homeModal$ = this.store.select(selectHomeModal);
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
      filter(Boolean),
      takeUntil(this.destroyed$),
    ).subscribe((queryParam) => {
      const currentQueryParam = ['payingCommandId', 'waitingWizzCommandId', 'wizzCommandId', 'payedCommandId']
        .find((actionParam) => queryParam.has(actionParam))

      if (currentQueryParam) {
        const commandId = queryParam.get(currentQueryParam)!
        this.store.dispatch(fetchingPersonalCommand({ commandId }));
      }
    });

    this.personalCommand$
      .pipe(filter(Boolean), takeUntil(this.destroyed$))
      .subscribe(async (command: Command) => {
        this.personalCommand = command;

        this.listenWizzEvent(command);
        this.queryParamsManaging(command);
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
    this.store.dispatch(openHomeModal({ modal: 'payment' }));
    this.isPaymentModalBackBtn = enableBackBtn;
    this.notification.remove(this.commandNotificationIdByCommandId[this.personalCommand!.id]);
  }

  handlePaymentBack(): void {
    this.store.dispatch(openHomeModal({ modal: 'success' }));
  }

  handlePaymentClose(): void {
    this.store.dispatch(closeHomeModal());
    this.openWaitingConfirmationNotification();
  }

  handleCommandCancelled(origin: 'human' | 'time'): void {
    this.store.dispatch(closeHomeModal());

    if (origin === 'human') {
      this.store.dispatch(cancelPersonalCommand({
        commandId: this.personalCommand!.id,
      }));
    }
  }

  handleCloseErrorModal(): void {
    this.router.navigate(['.'], { relativeTo: this.route });
    this.store.dispatch(closeErrorModal());
  }

  handleCloseSuccessModal(): void {
    this.store.dispatch(closeHomeModal());
    this.openWaitingConfirmationNotification();
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  private queryParamsManaging(personalCommand: Command): void {
    if (this.route.snapshot.queryParams.hasOwnProperty('waitingWizzCommandId')) {
      this.openWaitingConfirmationNotification();
      this.router.navigate(['.'], { relativeTo: this.route });
    } else if (this.route.snapshot.queryParams.hasOwnProperty('payingCommandId')) {
      setTimeout(() => {
        this.store.dispatch(openHomeModal({ modal: 'payment' }));
      }, 1000); // to avoid a huge weird freeze
      this.router.navigate(['.'], { relativeTo: this.route });
    } else if (this.route.snapshot.queryParams.hasOwnProperty('wizzCommandId')) {
      this.openSentCommandNotification();
      this.router.navigate(['.'], { relativeTo: this.route });
    } else if (this.route.snapshot.queryParams.hasOwnProperty('payedCommandId')) {
      if (personalCommand.paymentRequired) {
        setTimeout(() => {
          this.store.dispatch(openHomeModal({ modal: 'success' }));
        }, 1000); // to avoid a huge weird freeze
      } else {
        this.openWaitingConfirmationNotification();
      }
      this.router.navigate(['.'], { relativeTo: this.route });
    }
  }

  private openWaitingConfirmationNotification(): void {
    this.commandNotificationIdByCommandId[this.personalCommand!.id] = this.notification
      .create(
        'success',
        $localize`Votre commande #${this.personalCommand!.reference} a bien été envoyée !`,
        $localize`Pour être averti que votre commande est prête, ne rafraichissez pas cette page. Une notification vous préviendra.`, {
          nzDuration: 0,
          nzKey: this.personalCommand!.id,
          nzButton: this.notificationPayedBtnTemplate,
        },
      ).messageId;
  }

  private async listenWizzEvent(command: Command): Promise<void> {
    if (this.swPush.isEnabled) {
      try {
        const sub = await this.swPush.requestSubscription({
          serverPublicKey: VAPID_PUBLIC_KEY,
        });

        this.store.dispatch(
          sendNotificationSub({ commandId: command.id!, sub }),
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
      }),
    );
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
              }),
            );
          } else if (data.hasOwnProperty('wizz')) {
            const commandId = data.wizz.commandId;
            this.router.navigate(['.'], { relativeTo: this.route, queryParams: { wizzCommandId: commandId } });
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
        },
      });
  }

  private openSentCommandNotification(): void {
    this.notification.remove(this.commandNotificationIdByCommandId[this.personalCommand!.id]);

    this.notification
      .create(
        'info',
        $localize`Votre commande ${this.personalCommand!.reference} est prête !`,
        $localize`Bonne dégustation ! 🥰`, {
          nzDuration: 0,
          nzKey: this.personalCommand!.id,
        },
      );

    if (canVibrate()) window.navigator.vibrate([2000, 10, 2000]);

    this.audio = new Audio($localize`assets/sounds/french.mp3`);
    this.audio.pause();
    this.audio.currentTime = 0;
    this.audio.play();

    if (this.swPush.isEnabled) {
      try {
        this.swPush.unsubscribe();
      } catch (error) {
        console.log('Impossible to unsubscribe', error);
      }
    }
  }

}
