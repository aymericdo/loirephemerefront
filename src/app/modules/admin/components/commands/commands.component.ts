import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, ReplaySubject } from 'rxjs';
import { Command } from 'src/app/interfaces/command.interface';
import { AppState } from 'src/app/store/app.state';
import {
  addCommand,
  closingCommand,
  editCommand,
  fetchingRestaurantCommands,
  payingCommand,
  removeNotificationSub,
  sendNotificationSub,
} from 'src/app/modules/admin/store/admin.actions';
import {
  selectIsLoading,
  selectOnGoingCommands,
  selectPastCommands,
  selectTotalPayedCommands,
} from 'src/app/modules/admin/store/admin.selectors';
import {
  CommandWebSocketService,
  WebSocketData,
} from 'src/app/modules/admin/services/command-socket.service';
import { filter, takeUntil } from 'rxjs/operators';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { environment } from 'src/environments/environment';
import { SwPush } from '@angular/service-worker';
import { ActivatedRoute, Router } from '@angular/router';
import { Restaurant } from 'src/app/interfaces/restaurant.interface';
import { selectRestaurant } from 'src/app/modules/home/store/home.selectors';

@Component({
  templateUrl: './commands.component.html',
  styleUrls: ['./commands.component.scss'],
  providers: [CommandWebSocketService],
})
export class CommandsComponent implements OnInit, OnDestroy {
  onGoingCommands$: Observable<Command[]>;
  pastCommands$: Observable<Command[]>;
  totalPayedCommands$: Observable<number>;
  isLoading$: Observable<boolean>;
  restaurant$: Observable<Restaurant | null>;

  private sub: PushSubscription = null!;
  private restaurant: Restaurant = null!;

  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  readonly VAPID_PUBLIC_KEY =
    'BKLI0usipFB5k2h5ZqMWF67Ln222rePzgMMWG-ctCgDN4DISjK_sK2PICWF3bjDFbhZTYfLS0Wc8qEqZ5paZvec';

  constructor(
    private store: Store<AppState>,
    private wsService: CommandWebSocketService,
    private notification: NzNotificationService,
    private swPush: SwPush,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.onGoingCommands$ = this.store.select(selectOnGoingCommands);
    this.pastCommands$ = this.store.select(selectPastCommands);
    this.totalPayedCommands$ = this.store.select(selectTotalPayedCommands);
    this.isLoading$ = this.store.select(selectIsLoading);
    this.restaurant$ = this.store.select(selectRestaurant);
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.subscribeToWS(params.get('code')!);
    });

    this.route.queryParams.subscribe((params) => {
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
            serverPublicKey: this.VAPID_PUBLIC_KEY,
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
