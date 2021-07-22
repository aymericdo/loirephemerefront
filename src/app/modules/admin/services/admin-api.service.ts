import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AdminApiService {
  private readonly baseUrl: string;
  private readonly protocolHttp: string;

  constructor(private http: HttpClient) {
    this.baseUrl = environment.api;
    this.protocolHttp = environment.protocolHttp;
  }

  getAll(token: string): Observable<any> {
    const headers = { password: token };
    return this.http.get(`${this.protocolHttp}${this.baseUrl}/commands`, {
      headers,
    });
  }

  closeCommand(token: string, commandId: string): Observable<any> {
    const headers = { password: token };
    return this.http.patch(
      `${this.protocolHttp}${this.baseUrl}/commands/close/${commandId}`,
      {
        headers,
      }
    );
  }

  payedCommand(token: string, commandId: string): Observable<any> {
    const headers = { password: token };
    return this.http.patch(
      `${this.protocolHttp}${this.baseUrl}/commands/payed/${commandId}`,
      {
        headers,
      }
    );
  }

  postSub(sub: any): Observable<any> {
    return this.http.post(
      `${this.protocolHttp}${this.baseUrl}/admin/notification`,
      { sub }
    );
  }
}
