import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { CoreUser, User } from 'src/app/interfaces/user.interface';

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
      `${this.protocolHttp}${this.baseUrl}/users/not-exists?email=${email}`,
    ) as Observable<boolean>;
  }

  getUser(): Observable<User> {
    return this.http.get(
      `${this.protocolHttp}${this.baseUrl}/users`,
    ) as Observable<User>;
  }

  postUser(user: CoreUser, emailCode: string, code2: string): Observable<User> {
    return this.http.post(
      `${this.protocolHttp}${this.baseUrl}/users`,
      { ...user, emailCode, code2 }
    ) as Observable<User>;
  }

  postConfirmEmailUser(email: string): Observable<string> {
    return this.http.post(
      `${this.protocolHttp}${this.baseUrl}/users/confirm-email`,
      { email }
    ) as Observable<string>;
  }

  postConfirmRecoverEmailUser(email: string): Observable<string> {
    return this.http.post(
      `${this.protocolHttp}${this.baseUrl}/users/confirm-recover-email`,
      { email }
    ) as Observable<string>;
  }

  postValidateRecoverEmailCode(email: string, emailCode: string, code2: string): Observable<boolean> {
    return this.http.post(
      `${this.protocolHttp}${this.baseUrl}/users/validate-recover-email-code`,
      { email, emailCode, code2 }
    ) as Observable<boolean>;
  }

  postChangePassword(email: string, password: string, emailCode: string, code2: string): Observable<boolean> {
    return this.http.post(
      `${this.protocolHttp}${this.baseUrl}/users/change-password`,
      { email, password, emailCode, code2 }
    ) as Observable<boolean>;
  }

  postAuthLogin(user: CoreUser): Observable<{ access_token: string }> {
    return this.http.post(
      `${this.protocolHttp}${this.baseUrl}/users/auth/login`,
      user
    ) as Observable<{ access_token: string }>;
  }
}
