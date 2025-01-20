import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PaymentElementApiService {
  private readonly baseUrl: string;
  private readonly protocolHttp: string;

  constructor(
    private http: HttpClient,
  ) {
    this.baseUrl = environment.api;
    this.protocolHttp = environment.protocolHttp;
  }

  createCheckoutSession(commandReference: string): Observable<{ clientSecret: string }> {
    return this.http.post(`${this.protocolHttp}${this.baseUrl}/payments/create-checkout-session`, {
      commandReference,
    }) as Observable<{ clientSecret: string }>;
  }
}
