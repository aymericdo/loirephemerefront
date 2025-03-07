import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ProfileApiService {
  private readonly baseUrl: string;
  private readonly protocolHttp: string;

  constructor(private http: HttpClient) {
    this.baseUrl = environment.api;
    this.protocolHttp = environment.protocolHttp;
  }

  postChangePassword(oldPassword: string, password: string): Observable<boolean> {
    return this.http.post(
      `${this.protocolHttp}${this.baseUrl}/users/change-old-password`,
      { oldPassword, password },
    ) as Observable<boolean>;
  }

  patchDisplayDemoResto(
    displayDemoResto: boolean): Observable<boolean> {
    return this.http.patch(
      `${this.protocolHttp}${this.baseUrl}/users/display-demo-resto`,
      { displayDemoResto },
    ) as Observable<boolean>;
  }

  patchWaiterMode(
    waiterMode: boolean): Observable<boolean> {
    return this.http.patch(
      `${this.protocolHttp}${this.baseUrl}/users/waiter-mode`,
      { waiterMode },
    ) as Observable<boolean>;
  }
}
