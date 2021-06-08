import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

type WebSocketDataType = 'addCommand' | 'closeCommand';

type WebSocketData<T> = {
  [K in WebSocketDataType]: T;
};

export class WebSocketService {
  ws!: WebSocket;
  socketIsOpen = 1;

  createObservableSocket<T>(type: WebSocketDataType): Observable<T> {
    this.ws = new WebSocket(`${environment.protocolWs}${environment.api}`);

    return new Observable((observer) => {
      this.ws.onmessage = (event) => observer.next(event.data);
      this.ws.onerror = (event) => observer.error(event);
      this.ws.onclose = (event) => observer.complete();

      return () => this.ws.close(1000, 'The user disconnected');
    }).pipe(
      map((data: any) => JSON.parse(data)),
      filter((data: WebSocketData<T>) => !!data[type]),
      map((data: WebSocketData<T>) => data[type])
    );
  }

  sendMessage(message: string): string {
    if (this.ws.readyState === this.socketIsOpen) {
      this.ws.send(message);
      return `Sent to server ${message}`;
    } else {
      return 'Message was not sent - the socket is closed';
    }
  }
}
