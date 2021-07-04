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
} from 'src/app/modules/admin/store/admin.actions';
import {
  selectIsLoading,
  selectOnGoingCommands,
  selectPastCommands,
} from 'src/app/modules/admin/store/admin.selectors';
import {
  WebSocketData,
  AdminWebSocketService,
} from 'src/app/modules/admin/services/admin-socket.service';
import { takeUntil } from 'rxjs/operators';
import { NzNotificationService } from 'ng-zorro-antd/notification';

@Component({
  templateUrl: './admin.component.html',
  providers: [AdminWebSocketService],
  styleUrls: ['./admin.component.scss'],
})
export class AdminComponent implements OnInit {
  onGoingCommands$: Observable<Command[]>;
  pastCommands$: Observable<Command[]>;
  isLoading$: Observable<boolean>;

  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  constructor(
    private store: Store<AppState>,
    private wsService: AdminWebSocketService,
    private notification: NzNotificationService
  ) {
    this.onGoingCommands$ = this.store.select(selectOnGoingCommands);
    this.pastCommands$ = this.store.select(selectPastCommands);
    this.isLoading$ = this.store.select(selectIsLoading);
  }

  ngOnInit(): void {
    this.store.dispatch(fetchCommands());

    this.subscribeToWS();
  }

  handleClickDone(command: Command): void {
    this.store.dispatch(closeCommand({ command }));
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
          this.subscribeToWS();
          console.log('The observable stream is complete');
        }
      );
  }
}
