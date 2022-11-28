import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { CoreUser, User } from 'src/app/interfaces/user.interface';
import { Restaurant } from 'src/app/interfaces/restaurant.interface';

@Injectable({
  providedIn: 'root',
})
export class LoginApiService {
  private readonly baseUrl: string;
  private readonly protocolHttp: string;

  constructor(private http: HttpClient) {
    this.baseUrl = environment.api;
    this.protocolHttp = environment.protocolHttp;
  }

  validateUserEmail(email: string): Observable<boolean> {
    return this.http.get(
      `${this.protocolHttp}${this.baseUrl}/users/validate?email=${email}`,
    ) as Observable<boolean>;
  }

  getUser(): Observable<User> {
    return this.http.get(
      `${this.protocolHttp}${this.baseUrl}/users`,
    ) as Observable<User>;
  }

  postUser(user: CoreUser): Observable<User> {
    return this.http.post(
      `${this.protocolHttp}${this.baseUrl}/users`,
      user
    ) as Observable<User>;
  }

  postAuthLogin(user: CoreUser): Observable<{ access_token: string }> {
    return this.http.post(
      `${this.protocolHttp}${this.baseUrl}/users/auth/login`,
      user
    ) as Observable<{ access_token: string }>;
  }
}
