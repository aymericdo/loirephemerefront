import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
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

@Component({
  templateUrl: './admin.component.html',
  providers: [WebSocketService],
  styleUrls: ['./admin.component.scss'],
})
export class AdminComponent implements OnInit {
  onGoingCommands$: Observable<Command[]>;
  pastCommands$: Observable<Command[]>;

  messageFromServer: string = '';
  wsSubscription: Subscription;
  status = '';

  constructor(
    private store: Store<AppState>,
    private wsService: WebSocketService
  ) {
    this.onGoingCommands$ = this.store.select(selectOnGoingCommands);
    this.pastCommands$ = this.store.select(selectPastCommands);

    this.wsSubscription = this.wsService
      .createObservableSocket(`ws://${environment.api}`, 'command')
      .subscribe(
        (command: Command | any) => {
          this.store.dispatch(addCommand({ command }));
        },
        (err) => console.log('err'),
        () => console.log('The observable stream is complete')
      );
  }

  ngOnInit(): void {
    this.store.dispatch(fetchCommands());
  }

  closeSocket() {
    this.wsSubscription.unsubscribe();
    this.status = 'The socket is closed';
  }

  handleClickDone(command: Command): void {
    this.store.dispatch(closeCommand({ command }));
  }

  ngOnDestroy() {
    this.closeSocket();
  }
}
