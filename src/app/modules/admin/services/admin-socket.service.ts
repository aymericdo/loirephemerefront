import { Observable } from 'rxjs';
import { filter, map, tap } from 'rxjs/operators';
import { Command } from 'src/app/interfaces/command.interface';
import { environment } from 'src/environments/environment';

const webSocketDataKey = ['addCommand', 'closeCommand'];
const SOCKET_IS_OPEN = 1;

export type WebSocketData = {
  [key: string]: Command | 'bonjour';
};

export class AdminWebSocketService {
  ws!: WebSocket;

  createObservableSocket(): Observable<WebSocketData> {
    this.ws = new WebSocket(`${environment.protocolWs}${environment.api}`);

    return new Observable((observer) => {
      this.ws.onmessage = (event) => observer.next(event.data);
      this.ws.onerror = (event) => observer.error(event);
      this.ws.onclose = (event) => observer.complete();

      return () => this.ws.close(1000, 'The admin disconnected');
    }).pipe(
      map((data: any) => JSON.parse(data) as WebSocketData),
      tap((data: WebSocketData) => {
        if (data.hello === 'bonjour') {
          this.sendMessage(
            JSON.stringify({
              event: 'authorization',
              data: localStorage.getItem('token') as string,
            })
          );
        }
      }),
      filter((data: WebSocketData) =>
        webSocketDataKey.some((key) => Object.keys(data).includes(key))
      )
    );
  }

  sendMessage(message: string): string {
    if (this.ws.readyState === SOCKET_IS_OPEN) {
      this.ws.send(message);
      return `Sent to server ${message}`;
    } else {
      return 'Message was not sent - the socket is closed';
    }
  }
}
