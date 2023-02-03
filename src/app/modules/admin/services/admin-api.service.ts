import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { environment as prodEnvironment } from 'src/environments/environment.prod';
import { CorePastry, Pastry } from 'src/app/interfaces/pastry.interface';
import { Command } from 'src/app/interfaces/command.interface';
import { Access, User } from 'src/app/interfaces/user.interface';
import { Restaurant } from 'src/app/interfaces/restaurant.interface';

@Injectable({
  providedIn: 'root',
})
export class AdminApiService {
  private readonly baseUrl: string;
  private readonly protocolHttp: string;
  private readonly prodBaseUrl: string | null = null;
  private readonly prodProtocolHttp: string | null = null;

  constructor(private http: HttpClient) {
    this.baseUrl = environment.api;
    this.protocolHttp = environment.protocolHttp;

    if (!environment.production) {
      this.prodBaseUrl = prodEnvironment.api;
      this.prodProtocolHttp = prodEnvironment.protocolHttp;
    }
  }

  getImageUrl(imageName: string): string {
    return `${this.protocolHttp}${this.baseUrl}/photos/${imageName}`;
  }

  getProdImageUrl(imageName: string): string {
    if (environment.production) {
      throw 'fonction for dev purpose';
    }

    return `${this.prodProtocolHttp}${this.prodBaseUrl}/photos/${imageName}`;
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
      `${this.protocolHttp}${this.baseUrl}/pastries/by-code/${code}/pastries/${pastryId}/is-already-ordered`,
    ) as Observable<boolean>;
  }

  postPastry(code: string, pastry: CorePastry): Observable<Pastry> {
    return this.http.post(
      `${this.protocolHttp}${this.baseUrl}/pastries/by-code/${code}`,
      pastry
    ) as Observable<Pastry>;
  }

  putPastry(code: string, pastry: CorePastry):
    Observable<{ pastry: Pastry, displaySequenceById: { [pastryId: string]: number } }> {
    return this.http.put(
      `${this.protocolHttp}${this.baseUrl}/pastries/by-code/${code}`,
      pastry
    ) as Observable<{ pastry: Pastry, displaySequenceById: { [pastryId: string]: number } }>;
  }

  putEditCommonStockPastry(code: string, pastryIds: string[], commonStock: string): Observable<Pastry[]> {
    return this.http.put(
      `${this.protocolHttp}${this.baseUrl}/pastries/by-code/${code}/common-stock`, {
        pastryIds,
        commonStock,
      }
    ) as Observable<Pastry[]>;
  }

  getAllPastries(restaurantCode: string): Observable<Pastry[]> {
    return this.http.get(`${this.protocolHttp}${this.baseUrl}/pastries/by-code/${restaurantCode}/all`) as Observable<Pastry[]>;
  }

  getAllUsers(restaurantCode: string): Observable<User[]> {
    return this.http.get(`${this.protocolHttp}${this.baseUrl}/users/by-code/${restaurantCode}/all`) as Observable<User[]>;
  }

  getCommandsByCode(code: string, fromDate: string, toDate: string, stats = false): Observable<Command[]> {
    return this.http.get(`${this.protocolHttp}${this.baseUrl}/commands/by-code/${code}${stats ? '/stats' : ''}?fromDate=${fromDate}&toDate=${toDate}`) as Observable<Command[]>;;
  }

  closeCommand(code: string, commandId: string): Observable<any> {
    return this.http.patch(
      `${this.protocolHttp}${this.baseUrl}/commands/by-code/${code}/close/${commandId}`, null
    );
  }

  payedCommand(code: string, commandId: string): Observable<any> {
    return this.http.patch(
      `${this.protocolHttp}${this.baseUrl}/commands/by-code/${code}/payed/${commandId}`, null
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

  deleteUserToRestaurant(code: string, id: string): Observable<boolean> {
    return this.http.post(
      `${this.protocolHttp}${this.baseUrl}/users/by-code/${code}/delete`,
      { id }
    ) as Observable<boolean>;
  }

  patchUserRestaurantAccess(code: string, id: string, access: Access[]): Observable<User> {
    return this.http.patch(
      `${this.protocolHttp}${this.baseUrl}/users/by-code/${code}`,
      { id, access }
    ) as Observable<User>;
  }

  postSub(sub: PushSubscription, code: string): Observable<any> {
    return this.http.post(
      `${this.protocolHttp}${this.baseUrl}/commands/by-code/${code}/notification`,
      { sub }
    );
  }

  deleteSub(sub: PushSubscription, code: string): Observable<any> {
    return this.http.post(
      `${this.protocolHttp}${this.baseUrl}/commands/by-code/${code}/notification/delete`,
      { sub }
    );
  }

  patchOpeningTime(
    code: string,
    openingTime: { [weekDay: number]: { startTime: string; endTime: string } }): Observable<Restaurant> {
    return this.http.patch(
      `${this.protocolHttp}${this.baseUrl}/restaurants/by-code/${code}/opening-time`,
      { openingTime }
    ) as Observable<Restaurant>;
  }

  patchOpeningPickupTime(
    code: string,
    openingTime: { [weekDay: number]: { startTime: string; endTime: string } }): Observable<Restaurant> {
    return this.http.patch(
      `${this.protocolHttp}${this.baseUrl}/restaurants/by-code/${code}/opening-pickup-time`,
      { openingTime }
    ) as Observable<Restaurant>;
  }
}
