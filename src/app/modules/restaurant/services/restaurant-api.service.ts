import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { CoreRestaurant, Restaurant } from 'src/app/interfaces/restaurant.interface';

@Injectable({
  providedIn: 'root',
})
export class RestaurantApiService {
  private readonly baseUrl: string;
  private readonly protocolHttp: string;

  constructor(private http: HttpClient) {
    this.baseUrl = environment.api;
    this.protocolHttp = environment.protocolHttp;
  }

  postRestaurant(restaurant: CoreRestaurant): Observable<Restaurant> {
    return this.http.post(
      `${this.protocolHttp}${this.baseUrl}/restaurants`,
      restaurant
    ) as Observable<Restaurant>;
  }

  validateRestaurantName(name: string): Observable<boolean> {
    return this.http.get(
      `${this.protocolHttp}${this.baseUrl}/restaurants/not-exists?name=${name}`,
    ) as Observable<boolean>;
  }

  getRestaurant(code: string): Observable<Restaurant> {
    return this.http.get(
      `${this.protocolHttp}${this.baseUrl}/restaurants/by-code/${code}`,
    ) as Observable<Restaurant>;
  }

  getRestaurantPublicKey(code: string): Observable<{ publicKey: string }> {
    return this.http.get(
      `${this.protocolHttp}${this.baseUrl}/restaurants/by-code/${code}/payment-information-public-key`,
    ) as Observable<{ publicKey: string }>;
  }

  getUserRestaurants(): Observable<Restaurant[]> {
    return this.http.get(
      `${this.protocolHttp}${this.baseUrl}/restaurants`,
    ) as Observable<Restaurant[]>;
  }

  getDemoResto(): Observable<Restaurant> {
    return this.http.get(
      `${this.protocolHttp}${this.baseUrl}/restaurants/demo-resto`,
    ) as Observable<Restaurant>;
  }
}
