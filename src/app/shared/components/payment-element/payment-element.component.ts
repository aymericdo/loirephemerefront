import { Component, OnDestroy, OnInit } from '@angular/core';

import { NgZorroModule } from 'src/app/shared/ngzorro.module';
import { BrowserModule } from '@angular/platform-browser';
import { PaymentElementApiService } from 'src/app/shared/components/payment-element/payment-element.service';
import { Observable, ReplaySubject, filter, take, takeUntil } from 'rxjs';
import { Store } from '@ngrx/store';
import { selectRestaurantPublicKey } from 'src/app/modules/login/store/login.selectors';
import { AppState } from 'src/app/store/app.state';
import { selectPersonalCommand } from 'src/app/modules/home/store/home.selectors';
import { Command } from 'src/app/interfaces/command.interface';

@Component({
  selector: 'app-payment-element',
  templateUrl: './payment-element.component.html',
  standalone: true,
  imports: [
    BrowserModule,
    NgZorroModule,
  ]
})
export class PaymentElementComponent implements OnInit, OnDestroy {
  selectRestaurantPublicKey$: Observable<string | undefined>;
  personalCommand$: Observable<Command | null>;

  private stripe: any = null;
  private commandReference = '';

  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  constructor(
    private store: Store<AppState>,
    private paymentElementService: PaymentElementApiService
  ) {
    this.personalCommand$ = this.store.select(selectPersonalCommand);
    this.selectRestaurantPublicKey$ = this.store.select(selectRestaurantPublicKey);
  }

  ngOnInit(): void {
    this.personalCommand$.pipe(filter(Boolean), take(1)).subscribe((personalCommand) => {
      this.commandReference = personalCommand.reference;
    });

    this.selectRestaurantPublicKey$.pipe(
      filter(Boolean),
      takeUntil(this.destroyed$),
    ).subscribe((restaurantPublicKey) => {
      this.invokeStripe(restaurantPublicKey);
    });

  }

  invokeStripe(restaurantPublicKey: string) {
    if (!window.document.getElementById('stripe-script')) {
      const script = window.document.createElement('script');
      script.id = 'stripe-script';
      script.type = 'text/javascript';
      script.src = 'https://js.stripe.com/v3/';
      script.onload = () => {
        // this.stripe = (<any>window).Stripe(environment.STRIPE_KEY);
        this.stripe = (<any>window).Stripe(restaurantPublicKey);
        this.preparePayment();
      };
      window.document.body.appendChild(script);
    }
  }

  async preparePayment() {
    this.paymentElementService.createCheckoutSession(this.commandReference).subscribe(async (res) => {
      const clientSecret = res['clientSecret'] as string;

      const checkout = await this.stripe.initEmbeddedCheckout({
        fetchClientSecret: () => clientSecret,
      });

      checkout.mount('#checkout');
    });
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
