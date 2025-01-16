import { Inject, Injectable, LOCALE_ID } from '@angular/core';
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
    @Inject(LOCALE_ID) private locale: string,
  ) {
    this.baseUrl = environment.api;
    this.protocolHttp = environment.protocolHttp;
  }

  createCheckoutSession(commandReference: string): Observable<{ clientSecret: string }> {
    return this.http.post(`${this.protocolHttp}${this.baseUrl}/payments/create-checkout-session`, {
      commandReference,
      locale: this.locale,
    }) as Observable<{ clientSecret: string }>;
  }
}
