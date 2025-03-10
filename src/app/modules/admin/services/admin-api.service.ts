import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { environment as prodEnvironment } from 'src/environments/environment.prod';
import { CorePastry, Pastry } from 'src/app/interfaces/pastry.interface';
import { Command, PaymentPossibility } from 'src/app/interfaces/command.interface';
import { Access, User } from 'src/app/interfaces/user.interface';
import { Restaurant } from 'src/app/interfaces/restaurant.interface';
import { Discount } from 'src/app/modules/admin/modules/commands/components/promo-modal/promo-modal.component';

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

  validatePastryName(code: string, pastryName: string, pastryId?: string): Observable<boolean> {
    let url = `${this.protocolHttp}${this.baseUrl}/pastries/by-code/${code}/not-exists?name=${pastryName}`;
    if (pastryId) {
      url += `&id=${pastryId}`;
    }
    return this.http.get(url) as Observable<boolean>;
  }

  validatePastryIsAlreadyOrdered(code: string, pastryId: string): Observable<boolean> {
    return this.http.get(
      `${this.protocolHttp}${this.baseUrl}/pastries/by-code/${code}/pastries/${pastryId}/is-already-ordered`,
    ) as Observable<boolean>;
  }

  postPastry(code: string, pastry: CorePastry): Observable<Pastry> {
    return this.http.post(
      `${this.protocolHttp}${this.baseUrl}/pastries/by-code/${code}`,
      pastry,
    ) as Observable<Pastry>;
  }

  putPastry(code: string, pastry: CorePastry):
    Observable<{ pastry: Pastry, displaySequenceById: { [pastryId: string]: number } }> {
    return this.http.put(
      `${this.protocolHttp}${this.baseUrl}/pastries/by-code/${code}`,
      pastry,
    ) as Observable<{ pastry: Pastry, displaySequenceById: { [pastryId: string]: number } }>;
  }

  putEditCommonStockPastry(code: string, pastryIds: string[], commonStock: string): Observable<Pastry[]> {
    return this.http.put(
      `${this.protocolHttp}${this.baseUrl}/pastries/by-code/${code}/common-stock`, {
        pastryIds,
        commonStock,
      },
    ) as Observable<Pastry[]>;
  }

  getAllPastries(restaurantCode: string): Observable<Pastry[]> {
    return this.http.get(`${this.protocolHttp}${this.baseUrl}/pastries/by-code/${restaurantCode}/all`) as Observable<Pastry[]>;
  }

  getAllUsers(restaurantCode: string): Observable<User[]> {
    return this.http.get(`${this.protocolHttp}${this.baseUrl}/users/by-code/${restaurantCode}/all`) as Observable<User[]>;
  }

  getUsersCount(restaurantCode: string): Observable<number> {
    return this.http.get(`${this.protocolHttp}${this.baseUrl}/users/by-code/${restaurantCode}/count`) as Observable<number>;
  }

  getCommandsByCode(code: string, fromDate: string, toDate: string, stats = false): Observable<Command[]> {
    return this.http.get(`${this.protocolHttp}${this.baseUrl}/commands/by-code/${code}${stats ? '/stats' : ''}?fromDate=${fromDate}&toDate=${toDate}`) as Observable<Command[]>;;
  }

  getCommandsCount(restaurantCode: string): Observable<{
    total: number,
    payed: number,
  }> {
    return this.http.get(`${this.protocolHttp}${this.baseUrl}/commands/by-code/${restaurantCode}/count`) as Observable<{
      total: number,
      payed: number,
    }>;
  }

  closeCommand(code: string, commandId: string): Observable<any> {
    return this.http.patch(
      `${this.protocolHttp}${this.baseUrl}/commands/by-code/${code}/close/${commandId}`, null,
    );
  }

  deletingCommand(code: string, commandId: string): Observable<any> {
    return this.http.patch(
      `${this.protocolHttp}${this.baseUrl}/commands/by-code/${code}/cancel/${commandId}`, null,
    );
  }

  payedCommand(code: string, commandId: string, payments: PaymentPossibility[], discount: Discount): Observable<any> {
    return this.http.patch(
      `${this.protocolHttp}${this.baseUrl}/commands/by-code/${code}/payed/${commandId}`, { payments, discount },
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
      { email },
    ) as Observable<User>;
  }

  deleteUserToRestaurant(code: string, id: string): Observable<boolean> {
    return this.http.post(
      `${this.protocolHttp}${this.baseUrl}/users/by-code/${code}/delete`,
      { id },
    ) as Observable<boolean>;
  }

  patchUserRestaurantAccess(code: string, id: string, access: Access[]): Observable<User> {
    return this.http.patch(
      `${this.protocolHttp}${this.baseUrl}/users/by-code/${code}/access`,
      { id, access },
    ) as Observable<User>;
  }

  patchUserRestaurantWaiterMode(code: string, id: string, waiterMode: boolean): Observable<User> {
    return this.http.patch(
      `${this.protocolHttp}${this.baseUrl}/users/by-code/${code}/waiter-mode`,
      { id, waiterMode },
    ) as Observable<User>;
  }

  postSub(sub: PushSubscription, code: string): Observable<any> {
    return this.http.post(
      `${this.protocolHttp}${this.baseUrl}/commands/by-code/${code}/notification`,
      { sub },
    );
  }

  deleteSub(code: string): Observable<any> {
    return this.http.post(
      `${this.protocolHttp}${this.baseUrl}/commands/by-code/${code}/notification/delete`,
      { },
    );
  }

  getTimezones(): Observable<string[]> {
    return this.http.get(
      `${this.protocolHttp}${this.baseUrl}/restaurants/timezones`,
    ) as Observable<string[]>;
  }

  updateRestaurantInformation(code: string, attributes: { timezone?: string, displayStock?: boolean }): Observable<Restaurant> {
    return this.http.patch(
      `${this.protocolHttp}${this.baseUrl}/restaurants/by-code/${code}`,
      attributes,
    ) as Observable<Restaurant>;
  }

  patchOpeningTime(
    code: string,
    openingTime: { [weekDay: number]: { startTime: string; endTime: string } }): Observable<Restaurant> {
    return this.http.patch(
      `${this.protocolHttp}${this.baseUrl}/restaurants/by-code/${code}/opening-time`,
      { openingTime },
    ) as Observable<Restaurant>;
  }

  patchOpeningPickupTime(
    code: string,
    openingTime: { [weekDay: number]: { startTime: string } }): Observable<Restaurant> {
    return this.http.patch(
      `${this.protocolHttp}${this.baseUrl}/restaurants/by-code/${code}/opening-pickup-time`,
      { openingTime },
    ) as Observable<Restaurant>;
  }

  postPaymentInformation(
    code: string,
    paymentActivated: boolean,
    paymentRequired: boolean,
    publicKey: string,
    secretKey: string,
  ): Observable<Restaurant> {
    return this.http.post(
      `${this.protocolHttp}${this.baseUrl}/restaurants/by-code/${code}/payment-information`,
      { paymentActivated, paymentRequired, publicKey, secretKey },
    ) as Observable<Restaurant>;
  }

  patchAlwaysOpen(
    code: string,
    alwaysOpen: boolean): Observable<Restaurant> {
    return this.http.patch(
      `${this.protocolHttp}${this.baseUrl}/restaurants/by-code/${code}/always-open`,
      { alwaysOpen },
    ) as Observable<Restaurant>;
  }
}
