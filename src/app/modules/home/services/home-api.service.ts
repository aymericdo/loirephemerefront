import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Command } from 'src/app/interfaces/command.interface';

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

  getAll(): Observable<any> {
    return this.http.get(`${this.protocolHttp}${this.baseUrl}/pastries`);
  }

  postCommand(command: Command): Observable<any> {
    return this.http.post(
      `${this.protocolHttp}${this.baseUrl}/commands`,
      command
    );
  }

  postSub(sub: any): Observable<any> {
    return this.http.post(
      `${this.protocolHttp}${this.baseUrl}/pastries/notification`,
      sub
    );
  }
}
