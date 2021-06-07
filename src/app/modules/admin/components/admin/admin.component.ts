import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, ReplaySubject, Subscription } from 'rxjs';
import { Command } from 'src/app/interfaces/command.interface';
import { AppState } from 'src/app/store/app.state';
import {
  addCommand,
  closeCommand,
  fetchCommands,
} from 'src/app/modules/admin/store/admin.actions';
import {
  selectOnGoingCommands,
  selectPastCommands,
} from 'src/app/modules/admin/store/admin.selectors';
import { WebSocketService } from 'src/app/modules/admin/services/admin-socket.service';
import { environment } from 'src/environments/environment';
import { takeUntil } from 'rxjs/operators';

@Component({
  templateUrl: './admin.component.html',
  providers: [WebSocketService],
  styleUrls: ['./admin.component.scss'],
})
export class AdminComponent implements OnInit {
  onGoingCommands$: Observable<Command[]>;
  pastCommands$: Observable<Command[]>;

  messageFromServer: string = '';
  status = '';

  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  constructor(
    private store: Store<AppState>,
    private wsService: WebSocketService
  ) {
    this.onGoingCommands$ = this.store.select(selectOnGoingCommands);
    this.pastCommands$ = this.store.select(selectPastCommands);
  }

  ngOnInit(): void {
    this.store.dispatch(fetchCommands());

    this.wsService
      .createObservableSocket(
        `${environment.protocolWs}${environment.api}`,
        'addCommand'
      )
      .pipe(takeUntil(this.destroyed$))
      .subscribe(
        (command: Command | any) => {
          this.store.dispatch(addCommand({ command }));
        },
        (err) => console.log('err'),
        () => console.log('The observable stream is complete')
      );

    this.wsService
      .createObservableSocket(
        `${environment.protocolWs}${environment.api}`,
        'closeCommand'
      )
      .pipe(takeUntil(this.destroyed$))
      .subscribe(
        (command: Command | any) => {
          this.store.dispatch(closeCommand({ command }));
        },
        (err) => console.log('err'),
        () => console.log('The observable stream is complete')
      );
  }

  closeSocket() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
    this.status = 'The socket is closed';
  }

  handleClickDone(command: Command): void {
    this.store.dispatch(closeCommand({ command }));
  }

  ngOnDestroy() {
    this.closeSocket();
  }
}
