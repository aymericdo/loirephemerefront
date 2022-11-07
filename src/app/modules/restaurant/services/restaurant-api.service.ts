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

  getAll(): Observable<any> {
    return this.http.get(`${this.protocolHttp}${this.baseUrl}/pastries/displayable`);
  }

  postRestaurant(restaurant: CoreRestaurant): Observable<Restaurant> {
    return this.http.post(
      `${this.protocolHttp}${this.baseUrl}/restaurants`,
      restaurant
    ) as Observable<Restaurant>;
  }

  validateRestaurantName(name: string): Observable<boolean> {
    return this.http.get(
      `${this.protocolHttp}${this.baseUrl}/restaurants/validate?name=${name}`,
    ) as Observable<boolean>;
  }
}
