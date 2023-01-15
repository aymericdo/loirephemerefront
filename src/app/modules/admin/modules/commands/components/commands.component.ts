import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SwPush } from '@angular/service-worker';
import { Store } from '@ngrx/store';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Observable, ReplaySubject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { VAPID_PUBLIC_KEY } from 'src/app/app.module';
import { Command } from 'src/app/interfaces/command.interface';
import { Restaurant } from 'src/app/interfaces/restaurant.interface';
import { addCommand, closingCommand, editCommand, fetchingRestaurantCommands, payingCommand, removeNotificationSub, sendNotificationSub, startLoading } from 'src/app/modules/admin/modules/commands/store/commands.actions';
import { selectDeliveredCommands, selectIsLoading, selectOnGoingCommands, selectPayedCommands, selectTotalPayedCommands } from 'src/app/modules/admin/modules/commands/store/commands.selectors';
import {
  CommandWebSocketService,
  WebSocketData
} from 'src/app/modules/admin/services/command-socket.service';
import { selectRestaurant } from 'src/app/modules/login/store/login.selectors';
import { AppState } from 'src/app/store/app.state';
import { environment } from 'src/environments/environment';

@Component({
  templateUrl: './commands.component.html',
  styleUrls: ['./commands.component.scss'],
  providers: [CommandWebSocketService],
})
export class CommandsComponent implements OnInit, OnDestroy {
  onGoingCommands$: Observable<Command[]>;
  deliveredCommands$: Observable<Command[]>;
  payedCommands$: Observable<Command[]>;
  totalPayedCommands$: Observable<number>;
  isLoading$: Observable<boolean>;
  restaurant$: Observable<Restaurant | null>;

  private sub: PushSubscription = null!;
  private restaurant: Restaurant = null!;

  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  constructor(
    private store: Store<AppState>,
    private wsService: CommandWebSocketService,
    private notification: NzNotificationService,
    private swPush: SwPush,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.onGoingCommands$ = this.store.select(selectOnGoingCommands);
    this.deliveredCommands$ = this.store.select(selectDeliveredCommands);
    this.payedCommands$ = this.store.select(selectPayedCommands);
    this.totalPayedCommands$ = this.store.select(selectTotalPayedCommands);
    this.isLoading$ = this.store.select(selectIsLoading);
    this.restaurant$ = this.store.select(selectRestaurant);
  }

  ngOnInit(): void {
    this.store.dispatch(startLoading());

    this.route.paramMap.pipe(
      takeUntil(this.destroyed$)
    ).subscribe(params => {
      this.subscribeToWS(params.get('code')!);
    });

    this.route.queryParams.pipe(
      takeUntil(this.destroyed$)
    ).subscribe((params) => {
      if (!params['tab']) {
        this.router.navigate([], { relativeTo: this.route, queryParams: { tab: 'ongoing' } });
      }
    });

    this.restaurant$.pipe(
      filter(Boolean),
      takeUntil(this.destroyed$),
    ).subscribe((restaurant) => {
      this.restaurant = restaurant;
      this.fetchCommands(restaurant.code);

      if (environment.production) {
        this.swPush
          .requestSubscription({
            serverPublicKey: VAPID_PUBLIC_KEY,
          })
          .then((sub: PushSubscription) => {
            this.sub = sub;
            this.store.dispatch(sendNotificationSub({ sub, code: restaurant.code }));
          })
          .catch((err) =>
            console.error('Could not subscribe to notifications', err)
          );

        this.swPush.notificationClicks.subscribe((_event) => {
          this.router.navigate(['/']);
        });
      }
    });
  }

  handleClickDone(command: Command): void {
    this.store.dispatch(closingCommand({ command }));
  }

  handleClickPayed(command: Command): void {
    this.store.dispatch(payingCommand({ command }));
  }

  handleClickWizz(command: Command): void {
    this.wsService.sendMessage(
      JSON.stringify({
        event: 'wizzer',
        data: command,
      })
    );
  }

  ngOnDestroy() {
    if (this.sub) {
      this.store.dispatch(removeNotificationSub({ sub: this.sub, code: this.restaurant.code }));
    }
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  private fetchCommands(code: string): void {
    const fromDateNow = new Date();
    fromDateNow.setHours(0, 0, 0, 0);
    const fromDate: string = fromDateNow.toISOString(); // today.beginningOfDay

    const toDateNow = new Date();
    toDateNow.setHours(23, 59, 59, 999);
    const toDate: string = toDateNow.toISOString(); // today.endOfDay

    this.store.dispatch(fetchingRestaurantCommands({ code, fromDate, toDate }));
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
          if (data.hasOwnProperty('addCommand')) {
            this.store.dispatch(
              addCommand({ command: data.addCommand as Command })
            );
            window.navigator.vibrate(2000);
            this.notification.create(
              'info',
              'Une nouvelle commande est arrivée',
              '',
              {
                nzDuration: 5000,
              }
            );
          } else if (data.hasOwnProperty('closeCommand')) {
            this.store.dispatch(
              editCommand({ command: data.closeCommand as Command })
            );
          } else if (data.hasOwnProperty('payedCommand')) {
            this.store.dispatch(
              editCommand({ command: data.payedCommand as Command })
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
