import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, ReplaySubject } from 'rxjs';
import { Command } from 'src/app/interfaces/command.interface';
import { AppState } from 'src/app/store/app.state';
import {
  addCommand,
  closeCommand,
  editCommand,
  fetchCommands,
  payedCommand,
  sendNotificationSub,
} from 'src/app/modules/admin/store/admin.actions';
import {
  selectIsLoading,
  selectOnGoingCommands,
  selectPastCommands,
  selectPayedCommands,
} from 'src/app/modules/admin/store/admin.selectors';
import {
  WebSocketData,
  AdminWebSocketService,
} from 'src/app/modules/admin/services/admin-socket.service';
import { takeUntil } from 'rxjs/operators';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { environment } from 'src/environments/environment';
import { SwPush } from '@angular/service-worker';
import { Router } from '@angular/router';

@Component({
  templateUrl: './admin.component.html',
  providers: [AdminWebSocketService],
  styleUrls: ['./admin.component.scss'],
})
export class AdminComponent implements OnInit {
  onGoingCommands$: Observable<Command[]>;
  pastCommands$: Observable<Command[]>;
  payedCommands$: Observable<Command[]>;
  isLoading$: Observable<boolean>;

  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  readonly VAPID_PUBLIC_KEY =
    'BKLI0usipFB5k2h5ZqMWF67Ln222rePzgMMWG-ctCgDN4DISjK_sK2PICWF3bjDFbhZTYfLS0Wc8qEqZ5paZvec';

  constructor(
    private store: Store<AppState>,
    private wsService: AdminWebSocketService,
    private notification: NzNotificationService,
    private swPush: SwPush,
    private router: Router
  ) {
    this.onGoingCommands$ = this.store.select(selectOnGoingCommands);
    this.pastCommands$ = this.store.select(selectPastCommands);
    this.payedCommands$ = this.store.select(selectPayedCommands);
    this.isLoading$ = this.store.select(selectIsLoading);
  }

  ngOnInit(): void {
    this.store.dispatch(fetchCommands());

    this.subscribeToWS();

    if (environment.production) {
      this.swPush
        .requestSubscription({
          serverPublicKey: this.VAPID_PUBLIC_KEY,
        })
        .then((sub) => {
          this.store.dispatch(sendNotificationSub({ sub }));
        })
        .catch((err) =>
          console.error('Could not subscribe to notifications', err)
        );

      this.swPush.notificationClicks.subscribe((event) => {
        this.router.navigate(['/']);
      });
    }
  }

  handleClickDone(command: Command): void {
    this.store.dispatch(closeCommand({ command }));
  }

  handleClickPayed(command: Command): void {
    this.store.dispatch(payedCommand({ command }));
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
    this.destroyed$.next(true);
    this.destroyed$.complete();
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
        (err) => console.log('err'),
        () => {
          console.log('The observable stream is complete');
        }
      );
  }
}
