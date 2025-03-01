import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Command, CoreCommand } from 'src/app/interfaces/command.interface';
import { Pastry } from 'src/app/interfaces/pastry.interface';

@Injectable({
  providedIn: 'root',
})
export class HomeApiService {
  private readonly baseUrl: string;
  private readonly protocolHttp: string;

  constructor(private http: HttpClient) {
    this.baseUrl = environment.api;
    this.protocolHttp = environment.protocolHttp;
  }

  getPastries(restaurantCode: string): Observable<Pastry[]> {
    return this.http.get(`${this.protocolHttp}${this.baseUrl}/pastries/by-code/${restaurantCode}`) as Observable<Pastry[]>;
  }

  getPersonalCommand(restaurantCode: string, commandId: string): Observable<Command> {
    return this.http.get(
      `${this.protocolHttp}${this.baseUrl}/commands/by-code/${restaurantCode}/personal-command/${commandId}`,
    ) as Observable<Command>;
  }

  cancelPersonalCommand(restaurantCode: string, commandId: string): Observable<Command> {
    return this.http.delete(
      `${this.protocolHttp}${this.baseUrl}/commands/by-code/${restaurantCode}/personal-command/${commandId}`,
    ) as Observable<Command>;
  }

  markPersonalCommandAsPayed(restaurantCode: string, commandId: string, sessionId: string): Observable<Command> {
    return this.http.patch(
      `${this.protocolHttp}${this.baseUrl}/commands/by-code/${restaurantCode}/personal-command/${commandId}/mark-as-payed`, {
        sessionId,
      },
    ) as Observable<Command>;
  }

  postCommand(restaurantCode: string, command: CoreCommand): Observable<Command> {
    return this.http.post(
      `${this.protocolHttp}${this.baseUrl}/commands/by-code/${restaurantCode}`,
      command,
    ) as Observable<Command>;
  }

  postSub(commandId: string, sub: PushSubscription): Observable<any> {
    return this.http.post(
      `${this.protocolHttp}${this.baseUrl}/pastries/notification`,
      { commandId, sub },
    );
  }
}
