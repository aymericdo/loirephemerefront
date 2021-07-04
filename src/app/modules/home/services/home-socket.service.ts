import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

const webSocketDataKey = ['stockChanged', 'wizz'];
const SOCKET_IS_OPEN = 1;

export type WebSocketData = {
  [key: string]: { pastryId: string; newStock: number };
};

export class HomeWebSocketService {
  ws!: WebSocket;

  createObservableSocket(): Observable<WebSocketData> {
    this.ws = new WebSocket(`${environment.protocolWs}${environment.api}`);

    return new Observable((observer) => {
      this.ws.onmessage = (event) => observer.next(event.data);
      this.ws.onerror = (event) => observer.error(event);
      this.ws.onclose = (event) => observer.complete();

      return () => this.ws.close(1000, 'The user disconnected');
    }).pipe(
      map((data: any) => JSON.parse(data) as WebSocketData),
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
