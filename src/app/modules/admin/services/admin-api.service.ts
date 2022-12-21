import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { CorePastry, Pastry } from 'src/app/interfaces/pastry.interface';
import { Command } from 'src/app/interfaces/command.interface';
import { User } from 'src/app/interfaces/user.interface';

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

  getImageUrl(imageName: string): string {
    return `${this.protocolHttp}${this.baseUrl}/photos/${imageName}`;
  }

  getUploadImageUrl(code: string): string {
    return `${this.protocolHttp}${this.baseUrl}/pastries/by-code/${code}/upload-image`;
  }

  validatePastryName(code: string, pastryName: string): Observable<boolean> {
    return this.http.get(
      `${this.protocolHttp}${this.baseUrl}/pastries/by-code/${code}/not-exists?name=${pastryName}`,
    ) as Observable<boolean>;
  }

  validatePastryIsAlreadyOrdered(code: string, pastryId: string): Observable<boolean> {
    return this.http.get(
      `${this.protocolHttp}${this.baseUrl}/pastries/by-code/${code}/pastries/${pastryId}/isAlreadyOrdered`,
    ) as Observable<boolean>;
  }

  postPastry(code: string, pastry: CorePastry): Observable<Pastry> {
    return this.http.post(
      `${this.protocolHttp}${this.baseUrl}/pastries/by-code/${code}`,
      pastry
    ) as Observable<Pastry>;
  }

  putPastry(code: string, pastry: CorePastry): Observable<{ pastry: Pastry, displaySequenceById: { [pastryId: string]: number } }> {
    return this.http.put(
      `${this.protocolHttp}${this.baseUrl}/pastries/by-code/${code}`,
      pastry
    ) as Observable<{ pastry: Pastry, displaySequenceById: { [pastryId: string]: number } }>;
  }

  getAllPastries(restaurantCode: string): Observable<Pastry[]> {
    return this.http.get(`${this.protocolHttp}${this.baseUrl}/pastries/by-code/${restaurantCode}/all`) as Observable<Pastry[]>;
  }

  getAllUsers(restaurantCode: string): Observable<User[]> {
    return this.http.get(`${this.protocolHttp}${this.baseUrl}/users/by-code/${restaurantCode}/all`) as Observable<User[]>;
  }

  getCommandsByCode(code: string, fromDate: string, toDate: string): Observable<Command[]> {
    return this.http.get(`${this.protocolHttp}${this.baseUrl}/commands/by-code/${code}?fromDate=${fromDate}&toDate=${toDate}`) as Observable<Command[]>;;
  }

  closeCommand(commandId: string): Observable<any> {
    return this.http.patch(
      `${this.protocolHttp}${this.baseUrl}/commands/close/${commandId}`, null
    );
  }

  payedCommand(commandId: string): Observable<any> {
    return this.http.patch(
      `${this.protocolHttp}${this.baseUrl}/commands/payed/${commandId}`, null
    );
  }

  validateUserEmail(email: string): Observable<boolean> {
    return this.http.get(
      `${this.protocolHttp}${this.baseUrl}/users/exists?email=${email}`,
    ) as Observable<boolean>;
  }

  postUserToRestaurant(code: string, email: string): Observable<User> {
    return this.http.post(
      `${this.protocolHttp}${this.baseUrl}/users/by-code/${code}`,
      { email }
    ) as Observable<User>;
  }

  deleteUserToRestaurant(code: string, email: string): Observable<boolean> {
    return this.http.post(
      `${this.protocolHttp}${this.baseUrl}/users/by-code/${code}/delete`,
      { email }
    ) as Observable<boolean>;
  }

  postSub(sub: PushSubscription, code: string): Observable<any> {
    return this.http.post(
      `${this.protocolHttp}${this.baseUrl}/commands/notification`,
      { sub, code }
    );
  }

  deleteSub(sub: PushSubscription, code: string): Observable<any> {
    return this.http.post(
      `${this.protocolHttp}${this.baseUrl}/commands/notification/delete`,
      { sub, code }
    );
  }
}
